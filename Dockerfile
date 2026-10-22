# Pinned to the 21 Oct 2026 Node 24 LTS security release (Brotli decoder
# OOB write / RCE, TLS hostname-check bypasses, dns NUL truncation).
# Digest is the official multi-arch index for node:24.22.1-alpine
# (re-verified 22 Oct 2026). Node 24 has no linux/arm/v7 image; this
# workflow builds ubuntu-latest/amd64 only, so no 22.23.4 arm/v7 fallback.
FROM node:24.22.1-alpine@sha256:06d7adf3e0ef61a13f1d28682726366f97a15aa1888c934d3ecec86c33918b53
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --production --silent && mv node_modules ../
COPY . .
EXPOSE 13000
CMD ["node", "index.js"]
