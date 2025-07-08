from typing import List, Optional, Dict, Union
from pydantic import BaseModel, Field


class SecretFinding(BaseModel):
    category: str
    entity: str
    entity_type: str
    sanitized_entity: str


class LanguageFinding(BaseModel):
    name: str
    percent: float
    score: float


class TokenLimitationFinding(BaseModel):
    characters: int
    chunks_required: int
    difficult_words: int
    letters: int
    lines: int
    misspellings: int
    reading_time: float
    sentences: int
    syllables: int
    text_standard: str
    tokens: int
    tokens_limit: int
    words: int


class PromptFindings(BaseModel):
    Language_Detector: Optional[List[LanguageFinding]] = []
    Secrets: Optional[List[SecretFinding]] = []
    Token_Limitation: Optional[List[TokenLimitationFinding]] = []


class PromptLatency(BaseModel):
    Language_Detector: Optional[int] = Field(alias="Language Detector")
    Prompt_Injection_Classifier: Optional[int] = Field(alias="Prompt Injection Classifier")
    Regex: Optional[int]
    Secrets: Optional[int]
    Sensitive_Data: Optional[int] = Field(alias="Sensitive Data")
    Token_Limitation: Optional[int] = Field(alias="Token Limitation")
    Total: Optional[int]
    URLs_Detector: Optional[int] = Field(alias="URLs Detector")


class ProtectionActions(BaseModel):
    Language_Detector: Optional[str] = Field(alias="Language Detector")
    Prompt_Injection_Engine: Optional[str] = Field(alias="Prompt Injection Engine")
    Regex: Optional[str]
    Secrets: Optional[str]
    Sensitive_Data: Optional[str] = Field(alias="Sensitive Data")
    Token_Limitation: Optional[str] = Field(alias="Token Limitation")
    URLs_Detector: Optional[str] = Field(alias="URLs Detector")


class Scores(BaseModel):
    Secrets: Optional[Dict[str, Union[int, float]]] = Field(alias="Sensitive Data")


class Prompt(BaseModel):
    action: str
    findings: PromptFindings
    latency: PromptLatency
    modified_messages: Optional[str]
    modified_text: Optional[str]
    passed: bool
    protection_actions: ProtectionActions
    scores: Scores
    violating_findings: Optional[str]
    violations: Optional[List[str]]


class Result(BaseModel):
    action: str
    conversation_id: str
    latency: int
    monitor_only: bool
    prompt: Prompt
    prompt_response_id: str
    response: Optional[str]
    user: Optional[str]
    user_groups: Optional[str]
    totalLatency: int
    ruleInfo: Dict
    findings: Dict[str, List[str]]


class PromptInspectorResponse(BaseModel):
    reason: Optional[str]
    result: Result
    status: str
    ruleInfo: Dict
