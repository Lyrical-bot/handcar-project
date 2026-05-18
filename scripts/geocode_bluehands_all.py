from pathlib import Path
from urllib.parse import urlencode
from urllib.request import urlopen, Request
from urllib.error import HTTPError, URLError
import json
import time

PROJECT_ROOT = Path(__file__).resolve().parents[1]

INPUT_PATH = PROJECT_ROOT / "public" / "data" / "bluehands.json"
OUTPUT_PATH = PROJECT_ROOT / "public" / "data" / "bluehands_with_coords.json"
FAILED_PATH = PROJECT_ROOT / "public" / "data" / "bluehands_geocode_failed.json"

API_BASE_URL = "https://agreeable-field-0f19c7800.7.azurestaticapps.net"

# 너무 빠르게 호출하지 않기 위한 대기 시간
SLEEP_SECONDS = 0.35

# 몇 건마다 중간 저장할지
SAVE_EVERY = 25


def call_geocode_api(address):
    query = urlencode({"address": address})
    url = f"{API_BASE_URL}/api/geocode?{query}"

    request = Request(
        url,
        headers={
            "User-Agent": "hands-car-geocode-script"
        }
    )

    try:
        with urlopen(request, timeout=25) as response:
            body = response.read().decode("utf-8")
            return json.loads(body)

    except HTTPError as error:
        body = error.read().decode("utf-8", errors="replace")
        return {
            "found": False,
            "error": f"HTTP {error.code}: {body}"
        }

    except URLError as error:
        return {
            "found": False,
            "error": f"URL error: {error.reason}"
        }

    except Exception as error:
        return {
            "found": False,
            "error": str(error)
        }


def make_shop_key(shop):
    return shop.get("id") or f"{shop.get('name', '')}__{shop.get('addr', '')}"


def save_results(results):
    OUTPUT_PATH.write_text(
        json.dumps(results, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )

    failed = [item for item in results if not item.get("geocodeFound")]

    FAILED_PATH.write_text(
        json.dumps(failed, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )


def main():
    if not INPUT_PATH.exists():
        raise FileNotFoundError(f"입력 파일을 찾을 수 없습니다: {INPUT_PATH}")

    shops = json.loads(INPUT_PATH.read_text(encoding="utf-8"))

    if not isinstance(shops, list):
        raise TypeError("bluehands.json 데이터가 배열 형태가 아닙니다.")

    # 재실행 대비: 이미 변환된 결과가 있으면 이어서 처리
    existing_results = []
    existing_map = {}

    if OUTPUT_PATH.exists():
        try:
            existing_results = json.loads(OUTPUT_PATH.read_text(encoding="utf-8"))

            if isinstance(existing_results, list):
                existing_map = {
                    make_shop_key(item): item
                    for item in existing_results
                    if item.get("geocodeFound") and item.get("lat") and item.get("lng")
                }

                print(f"기존 변환 성공 데이터 감지: {len(existing_map)}건")
        except Exception:
            print("기존 결과 파일을 읽지 못했습니다. 처음부터 다시 진행합니다.")
            existing_results = []
            existing_map = {}

    results = []
    total = len(shops)

    print(f"입력 데이터: {total}건")
    print("전체 좌표 변환 시작")
    print("-" * 70)

    for index, shop in enumerate(shops, start=1):
        shop_key = make_shop_key(shop)
        name = shop.get("name", "")
        address = shop.get("addr", "")

        # 이미 성공한 데이터가 있으면 재사용
        if shop_key in existing_map:
            results.append(existing_map[shop_key])
            print(f"[{index}/{total}] 재사용: {name}")
            continue

        print(f"[{index}/{total}] {name}")
        print(f"주소: {address}")

        geocode = call_geocode_api(address)

        enriched = {
            **shop,
            "geocodeFound": bool(geocode.get("found")),
            "lat": geocode.get("lat"),
            "lng": geocode.get("lng"),
            "geocodeConfidence": geocode.get("confidence"),
            "formattedAddress": geocode.get("formattedAddress"),
        }

        if geocode.get("error"):
            enriched["geocodeError"] = geocode.get("error")

        if geocode.get("found"):
            print(
                f"성공: lat={geocode.get('lat')}, "
                f"lng={geocode.get('lng')}, "
                f"confidence={geocode.get('confidence')}"
            )
        else:
            print(f"실패: {geocode.get('error') or '검색 결과 없음'}")

        results.append(enriched)

        if index % SAVE_EVERY == 0:
            save_results(results)
            success_count = sum(1 for item in results if item.get("geocodeFound"))
            print(f"중간 저장 완료: {index}/{total}, 성공 {success_count}건")
            print("-" * 70)

        time.sleep(SLEEP_SECONDS)

    save_results(results)

    success_count = sum(1 for item in results if item.get("geocodeFound"))
    failed_count = len(results) - success_count

    print("=" * 70)
    print(f"저장 완료: {OUTPUT_PATH}")
    print(f"실패 목록 저장: {FAILED_PATH}")
    print(f"전체: {len(results)}건")
    print(f"성공: {success_count}건")
    print(f"실패: {failed_count}건")
    print("=" * 70)


if __name__ == "__main__":
    main()
