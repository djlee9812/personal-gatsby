# Map geography data

Vendored TopoJSON used by the homepage travel map (`src/components/travel-map.tsx`).

| File | Source | License |
|------|--------|---------|
| `ne_50m_admin_0_map_units.json` | [Natural Earth](https://www.naturalearthdata.com/) via [mtraynham/natural-earth-topo](https://github.com/mtraynham/natural-earth-topo) (`ne_50m_admin_0_map_units`) | Public domain (Natural Earth) |
| `states-10m.json` | [us-atlas](https://github.com/topojson/us-atlas) `@3` (`states-10m.json`) via jsDelivr | ISC (topojson/us-atlas); underlying US Census geometry is public domain |

Served at `/geo/...` from Gatsby `static/`.

## Stripped properties

`travel-map.tsx` only reads `name`, `geounit`, and `sovereignt` off each geometry, but
the vendored files ship the full Natural Earth / us-atlas property sets (63 props per
country). `scripts/strip-geo-properties.mjs` rewrites both files in place, keeping only
the properties actually used and leaving `arcs`/`transform`/topology untouched. This
cut `ne_50m_admin_0_map_units.json` from ~879 KB to ~604 KB (-31%); `states-10m.json`
already only carried `name` so it is effectively unchanged.

Re-run after re-vendoring either file from upstream:

```sh
npm run geo:strip
```
