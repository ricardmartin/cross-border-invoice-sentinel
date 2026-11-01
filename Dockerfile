# Web app (Next.js) + core + evals, one image. Two targets:
#   web    the inbox / review UI on :3000 (default)
#   evals  runs the eval suite and the gate: docker compose run --rm evals -- --contracts
FROM node:22-bookworm-slim AS deps
WORKDIR /repo
COPY package.json package-lock.json ./
COPY packages/core/package.json packages/core/
COPY evals/package.json evals/
COPY apps/web/package.json apps/web/
RUN npm ci

FROM deps AS source
COPY tsconfig.base.json ./
COPY packages packages
COPY evals evals
COPY apps apps

FROM source AS evals
ENV PROMPT_SOURCE=local
ENTRYPOINT ["npm", "run", "evals", "-w", "@sentinel/evals", "--"]

FROM source AS build
RUN npm run build:web

FROM node:22-bookworm-slim AS web
ENV NODE_ENV=production
WORKDIR /repo
COPY --from=build /repo /repo
RUN useradd --uid 10001 --create-home sentinel && mkdir -p apps/web/.data && chown -R sentinel apps/web/.data
USER sentinel
EXPOSE 3000
# Processed documents, delivery notes and suspended claim reviews (LibSQL) live here.
VOLUME ["/repo/apps/web/.data"]
CMD ["npm", "run", "start", "-w", "@sentinel/web"]
