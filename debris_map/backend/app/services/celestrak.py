import httpx

CELESTRAK_BASE_URL = "https://celestrak.org/NORAD/elements/gp.php"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "text/plain,*/*",
    "Accept-Language": "en-US,en;q=0.9",
}


async def fetch_tle(group: str) -> list[tuple[str, str, str]]:
    async with httpx.AsyncClient(timeout=10.0, headers=HEADERS, follow_redirects=True) as client:
        response = await client.get(
            CELESTRAK_BASE_URL, params={"GROUP": group, "FORMAT": "tle"}
        )
       
        response.raise_for_status()

    lines = [line.strip() for line in response.text.splitlines() if line.strip()]
    entries: list[tuple[str, str, str]] = []
    for i in range(0, len(lines) - 2, 3):
        name, line1, line2 = lines[i], lines[i + 1], lines[i + 2]
        entries.append((name, line1, line2))
    return entries

    x