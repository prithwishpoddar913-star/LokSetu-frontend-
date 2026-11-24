/**
 * Shared Asset Auto-Match & Safe Fallback Engine for LokSetu
 * Matches local assets in src/assets by normalized key against names/IDs
 * Handles homestays, destinations, handicrafts, guides, and stamps.
 */

const assetModules = import.meta.glob(
  "/src/assets/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}",
  { eager: true, import: "default" },
) as Record<string, string>;

export const normalizeKey = (s: string): string => {
  if (!s) return "";
  return s
    .toLowerCase()
    .replace(/\(.*?\)/g, "") // strip parenthesized notes e.g. (Demo), (Bishnupur)
    .replace(/[^a-z0-9]/g, "");
};

// Index local assets by normalized file basename
export const localAssets: Record<string, string> = {};

for (const [path, url] of Object.entries(assetModules)) {
  const fileName = path.split("/").pop()!.replace(/\.[^.]+$/, "");
  const key = normalizeKey(fileName);
  localAssets[key] = url;
}

/**
 * Direct lookup map for handicrafts by product id and normalized name
 */
const productAssetMap: Record<string, string> = {
  "wb-terracotta-bishnupur": localAssets["terracottatemplepanel"] || "",
  "wb-baluchari-saree": localAssets["balucharisilksaree"] || "",
  "wb-kantha-embroidery": localAssets["kanthaembroidereddupatta"] || "",
  "wb-darjeeling-tea-gift": localAssets["darjeelingfirstflushteagiftbox"] || "",
  "wb-murshidabad-silk": localAssets["murshidabadpuresilkstole"] || "",
  "bh-madhubani-painting": localAssets["madhubanipaintingkohbar"] || "",
  "bh-sikki-grass-basket": localAssets["sikkigrassjewellerybox"] || "",
  "bh-manjusha-art-box": localAssets["manjushaartlacqueredbox"] || "",
  "jh-bamboo-craft-tribal": localAssets["tribalbamboofruitbasket"] || "",
  "jh-dokra-metal-elephant": localAssets["dokrametalelephantfigurine"] || "",
  "jh-paitkar-painting": localAssets["paitkarscrollpainting"] || "",
};

/**
 * Returns an array of matched photos for a homestay.
 * Checks name, id, stripped suffixes (homestay, home, retreat, cottage),
 * numbered series (-1, -2, -3...), and district/city asset fallbacks.
 */
export function getHomestayAssets(
  homestay: { id: string; name: string; location?: string; district?: string } | string,
  fallbackImages: string[] = [],
): string[] {
  const results: string[] = [];

  const name = typeof homestay === "string" ? homestay : homestay.name;
  const id = typeof homestay === "string" ? "" : homestay.id;
  const district = typeof homestay === "string" ? "" : homestay.district;
  const location = typeof homestay === "string" ? "" : homestay.location;

  const baseCandidates = [
    normalizeKey(name),
    normalizeKey(id),
    normalizeKey(name.replace(/homestay|home|retreat|cottage|stay/gi, "")),
  ].filter(Boolean);

  for (const base of baseCandidates) {
    if (localAssets[base] && !results.includes(localAssets[base])) {
      results.push(localAssets[base]);
    }
    // Check numbered variations: e.g. bishnupurheritagehome1, 2, 3...
    for (let i = 1; i <= 6; i++) {
      const numKey = `${base}${i}`;
      if (localAssets[numKey] && !results.includes(localAssets[numKey])) {
        results.push(localAssets[numKey]);
      }
    }
  }

  // If no primary asset matched, check if district or city has a local scenic asset
  if (results.length === 0) {
    const locCandidates = [
      district ? normalizeKey(district) : "",
      location ? normalizeKey(location.split(",")[0]) : "",
    ].filter(Boolean);

    for (const loc of locCandidates) {
      if (localAssets[loc] && !results.includes(localAssets[loc])) {
        results.push(localAssets[loc]);
        break;
      }
    }
  }

  // Append any provided fallback images (filtering duplicates)
  for (const img of fallbackImages) {
    if (img && !results.includes(img)) {
      results.push(img);
    }
  }

  return results;
}

/**
 * Auto-match destination image from local assets or return fallback.
 * Accepts either an object { id, name } or a string name.
 */
export function getDestinationAsset(
  dest: { id?: string; name: string } | string,
  fallback?: string,
): string {
  if (!dest) return fallback || "";
  if (typeof dest === "string") {
    const key = normalizeKey(dest);
    return localAssets[key] || fallback || "";
  }
  const idKey = dest.id ? normalizeKey(dest.id) : "";
  const nameKey = dest.name ? normalizeKey(dest.name) : "";
  return localAssets[idKey] || localAssets[nameKey] || fallback || "";
}

/**
 * Auto-match handicraft product image from local assets or return fallback.
 * Flexible signature supports:
 *   getProductAsset(product)
 *   getProductAsset(product, fallback)
 *   getProductAsset(product.name, product.id)
 *   getProductAsset(name, id, fallback)
 */
export function getProductAsset(
  productOrName: { id?: string; name?: string; image?: string } | string,
  idOrFallback?: string,
  explicitFallback?: string,
): string {
  if (!productOrName) return explicitFallback || idOrFallback || "";

  let id = "";
  let name = "";
  let fallback = explicitFallback || "";

  if (typeof productOrName === "object") {
    id = productOrName.id || "";
    name = productOrName.name || "";
    fallback = idOrFallback || productOrName.image || "";
  } else {
    // string passed as first argument
    name = productOrName;
    if (idOrFallback && idOrFallback.startsWith("http")) {
      fallback = idOrFallback;
    } else if (idOrFallback) {
      id = idOrFallback;
    }
  }

  // 1. Direct ID lookup
  if (id && productAssetMap[id]) {
    return productAssetMap[id];
  }

  // 2. Normalized Name lookup
  const nameKey = normalizeKey(name);
  if (nameKey && localAssets[nameKey]) {
    return localAssets[nameKey];
  }

  // 3. Normalized ID lookup
  const idKey = normalizeKey(id);
  if (idKey && localAssets[idKey]) {
    return localAssets[idKey];
  }

  // 4. Substring / partial match on name
  if (nameKey) {
    for (const [key, url] of Object.entries(localAssets)) {
      if (nameKey.includes(key) || key.includes(nameKey)) {
        return url;
      }
    }
  }

  return fallback;
}

/**
 * Auto-match guide photo or return fallback.
 * Accepts either an object { id, name } or a string name.
 */
export function getGuideAsset(
  guide: { id?: string; name: string; district?: string } | string,
  fallback?: string,
): string {
  if (!guide) return fallback || "";
  if (typeof guide === "string") {
    const key = normalizeKey(guide);
    return localAssets[key] || fallback || "";
  }
  const nameKey = guide.name ? normalizeKey(guide.name) : "";
  const idKey = guide.id ? normalizeKey(guide.id) : "";
  return localAssets[nameKey] || localAssets[idKey] || fallback || "";
}
