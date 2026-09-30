# Sentinel AI implementation contract

## Provider routing

Evidence extraction is deterministic-first. `ProviderRouter` enriches OCR
facts with the configured Gemini or OpenAI provider, validates the response
against `StructuredEvidence`, and retains deterministic facts if the provider
is unavailable. Configure `LLM_PROVIDER`, `LLM_API_KEY`, `LLM_MODEL`, and
optionally `OPENAI_API_KEY`/`OPENAI_BASE_URL`.

## Evidence grounding

Entities, transactions, indicators, and relationships should carry an
`evidence_id` and optional `source_span`. Reports must only cite objects that
passed schema validation. Provider failures are warnings, not empty success
responses.

## Risk scoring

Risk responses include `model_version`, `confidence`, raw factor values, and
weighted factor contributions. This supports UI explanations, audit logs, and
later calibration without changing the API shape.

## Graph roadmap

The current in-memory graph contract now exposes centrality and risk-path
metrics. Neo4j Graph Data Science can replace those calculations with PageRank,
community detection, pathfinding, similarity, and link prediction while
preserving the same `nodes`, `edges`, `findings`, and `metrics` response.

## Semantic retrieval

`EmbeddingService` supports an external embedding provider when configured and
uses a deterministic local fallback otherwise. `SemanticSearch` indexes
case-scoped evidence and exposes `/api/search/index` and `/api/search/query`.
The current store is bounded in-memory for local operation; production should
replace it with pgvector, a Neo4j vector index, or a managed vector database
behind the same interface.

## Graph intelligence

The graph response includes local PageRank and common-neighbor link prediction.
When Neo4j GDS is available, `GraphPersistence.analytics()` runs PageRank and
Louvain on a case projection and returns the result under `gds`. Fallback and
GDS results are labeled separately.

## Model evaluation

`evaluate_binary()` emits versioned dataset metadata, a confusion matrix,
accuracy, precision, recall, F1, Brier score, and a conservative promotion
flag. Model artifacts should only be promoted when this metadata is stored
with the artifact and reviewed against a fixed validation split.
