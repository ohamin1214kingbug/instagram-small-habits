#!/usr/bin/env bash
# Publishes today's post from posts/ to Instagram.
# Post number = days since START_DATE + 1, so no state file is needed.
# ponytail: a failed day is skipped, not retried; add a posted-log if that matters.
set -euo pipefail
: "${START_DATE:?}" "${IMAGE_BASE_URL:?}"
API="${IG_API:-https://graph.instagram.com}"
cd "$(dirname "$0")"

day=$(jq -n --arg s "$START_DATE" '((now - ($s + "T00:00:00Z" | fromdate)) / 86400 | floor)')
n=$(printf %02d $((day + 1)))
if [ "$day" -lt 0 ] || [ ! -f "posts/$n.jpg" ]; then
  echo "No post for day $day (posts/$n.jpg). Nothing to do."; exit 0
fi

echo "Post $n: $IMAGE_BASE_URL/$n.jpg"
if [ -n "${DRY_RUN:-}" ]; then cat "posts/$n.txt"; exit 0; fi
: "${IG_TOKEN:?}" "${IG_USER_ID:?}"

container=$(curl -sfS -X POST "$API/$IG_USER_ID/media" \
  -H "Authorization: Bearer $IG_TOKEN" \
  --data-urlencode "image_url=$IMAGE_BASE_URL/$n.jpg" \
  --data-urlencode "caption@posts/$n.txt" | jq -r .id)

for _ in 1 2 3 4 5 6; do
  status=$(curl -sfS "$API/$container?fields=status_code" -H "Authorization: Bearer $IG_TOKEN" | jq -r .status_code)
  [ "$status" = FINISHED ] && break
  [ "$status" = ERROR ] && { echo "Container $container failed"; exit 1; }
  sleep 10
done

curl -sfS -X POST "$API/$IG_USER_ID/media_publish" \
  -H "Authorization: Bearer $IG_TOKEN" \
  --data-urlencode "creation_id=$container" | jq .
