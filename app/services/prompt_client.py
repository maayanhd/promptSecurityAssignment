import httpx

PROMPT_SECURITY_URL = "https://eu.prompt.security/api/protect"
APP_ID = "cc6a6cfc-9570-4e5a-b6ea-92d2adac90e4"


def inspect_text(prompt_text: str) -> dict:
    headers = {
        "APP-ID": APP_ID,
        "Content-Type": "application/json"
    }
    payload = {
        "prompt": prompt_text
    }

    with httpx.Client() as client:
        response = client.post(PROMPT_SECURITY_URL, headers=headers, json=payload)
        response.raise_for_status()
        return response.json()