from pathlib import Path
from urllib.parse import urlencode
from urllib.request import urlopen, Request
from urllib.error import HTTPError, URLError
import json
import time

PROJECT_ROOT = Path(__file__).resolve().parents[1]

INPUT_PATH = PROJECT_ROOT / "public" / "data" / "bluehands.json"
OUTPUT_PATH = PROJECT_ROOT / "public" / "data" / "bluehands_with_coords_sample.json"

API_BASE_URL = "https://agreeable-field-0f19c7800.7.azurestaticapps.net"
LIMIT = 10
SLEEP_SECONDS = 0.3


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
        with urlopen(request, timeout=20) as response:
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


def main():
    if not INPUT_PATH.exists():
        raise FileNotFoundError(f"입력 파일을 찾을 수 없습니다: {INPUT_PATH}")

    shops = json.loads(INPUT_PATH.read_text(encoding="utf-8"))

    if not isinstance(shops, list):
        raise TypeError("bluehands.json 데이터가 배열 형태가 아닙니다.")

    sample_shops = shops[:LIMIT]
    results = []

    print(f"입력 데이터: {len(shops)}건")
    print(f"샘플 변환 대상: {len(sample_shops)}건")
    print("-" * 60)

    for index, shop in enumerate(sample_shops, start=1):
        name = shop.get("name", "")
        address = shop.get("addr", "")

        print(f"[{index}/{len(sample_shops)}] {name}")
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
            print(f"성공: lat={geocode.get('lat')}, lng={geocode.get('lng')}, confidence={geocode.get('confidence')}")
        else:
            print(f"실패: {geocode.get('error') or '검색 결과 없음'}")

        results.append(enriched)
        print("-" * 60)

        time.sleep(SLEEP_SECONDS)

    OUTPUT_PATH.write_text(
        json.dumps(results, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )

    success_count = sum(1 for item in results if item.get("geocodeFound"))

    print(f"저장 완료: {OUTPUT_PATH}")
    print(f"성공: {success_count}/{len(results)}건")


if __name__ == "__main__":
    main()
