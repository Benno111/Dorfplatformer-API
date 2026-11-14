# Dorfplatformer-API
the apis for dorfplatformer timetravel.

## Game update manifest

[`update-manifest.json`](update-manifest.json) keeps stable version and installer
fields at the top level for existing clients. `channels` additionally lists the
published nightly manifests by edition, platform and architecture, plus the
weekly prerelease schedule anchored to November 10, 2026 at 00:00 UTC.

Channel-capable games select channels in Settings → Updater. Channel manifests
are hosted as game release assets and advance independently of this stable
manifest. The URL templates support `full` and `lite`; Android uses `universal`
as its architecture. A template describes the endpoint convention, not an
available build. Unpublished targets are omitted from `manifest_urls`.
Prerelease remains `awaiting_first_snapshot` until a weekly snapshot is published.
