// Photo for each dish. Priority: photo uploaded from the dashboard (item.image)
// → dish-specific photo below → category fallback.
const U = (id, by) => ({ src: `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=480&h=480&q=75`, by })
const G = (id) => ({ src: `https://api.whacka.app/storage/v1/object/public/app-images/projects/8f297959-c324-4ab8-a7fc-cbc91d8b8266/${id}.png` })

const P = {
  margherita: U('1604068549290-dea0e4a305ca', 'amirali mirhashemian'),
  herbs: U('1590947132387-155cc02f3212', 'Vit Ch'),
  sausage: U('1604382354936-07c5d9983bd3', 'Shourav Sheikh'),
  pepper: U('1625395005224-0fce68a3cdc8', 'Pranjall Kumar'),
  square: U('1632935254449-e777adc9addf', 'ABHISHEK HAJARE'),
  mushroom: U('1692737580563-7ba2d896f0f6', 'David Foodphototasty'),
  pepperoni: U('1628840042765-356cda07504e', 'Fernando Andrade'),
}
const SW = {
  baguette: G('gen-f8a3ec1f-1791151096825'),
  panini: G('gen-5980af3b-1791151096785'),
  brioche: U('1700937244987-92488ab2ada5', 'Crunch'),
}
const BG = {
  fries: U('1548077446-8ee8a91f298d', 'Mehrshad Rajabi'),
  classic: U('1568901346375-23c9450c58cd', 'amirali mirhashemian'),
  gourmet: U('1610440042657-612c34d95e9f', 'Eiliv Aceron'),
  crispy: G('gen-77dbd375-1791151096399'),
}
const TACOS = G('gen-553cf5be-1791151096802')
const PLAT = { poulet: G('gen-6b8532a3-1791151096428'), escalope: G('gen-b799f4c2-1791151098702'), mixte: G('gen-639f435c-1791151097117') }
const POUT = { loaded: U('1639744210631-209fce3e256c', 'Jay Gajjar'), garlic: U('1639744091981-2f826321fae6', 'Jay Gajjar') }
const NUGGETS = U('1585236944937-53a98463f009', 'LikeMeat')
const FRIES = U('1598679253544-2c97992403ea', 'Logan Weaver')
const SAUCES = G('gen-fd61e45c-1791151096814')
const CANS = G('gen-4c59bcf3-1791151096499')
const WATER = G('gen-c37eba34-1791151096375')
const SODA = U('1648569883125-d01072540b4c', 'Ivan Yerokhin')
const JUICE = U('1600271886742-f049cd451bba', 'ABHISHEK HAJARE')

const BY_SKU = {
  'pz-marguerite': P.margherita, 'pz-chicky': P.herbs, 'pz-meatino': P.sausage, 'pz-veggie': P.pepper,
  'pz-tuna': P.square, 'pz-boisee': P.mushroom, 'pz-beefino': P.pepperoni, 'pz-fromaggio': P.margherita,
  'pz-mexicano': P.sausage, 'pz-smoky': P.pepperoni, 'pz-saison-mix': P.mushroom, 'pz-yummy': P.herbs,
  'pz-mega-yummy': P.pepper,
  'sw-supreme': SW.baguette, 'sw-classic-beef': SW.baguette, 'sw-marinato': SW.panini, 'sw-le-crunch': SW.brioche,
  'sw-le-combo': SW.baguette, 'sw-panenka': SW.panini, 'sw-yummy-prime': SW.brioche,
  'bg-classique': BG.fries, 'bg-le-crousti': BG.crispy, 'bg-giga': BG.classic, 'bg-yummy': BG.gourmet,
  'pl-poulet': PLAT.poulet, 'pl-escalope': PLAT.escalope, 'pl-mixte': PLAT.mixte,
  'tc-poulet': TACOS, 'tc-viande': TACOS, 'tc-mixte': TACOS,
  'pt-classique': POUT.loaded, 'pt-poulet': POUT.garlic, 'pt-viande': POUT.loaded,
  'kd-burger': BG.fries, 'kd-nuggets': NUGGETS,
  'sp-frites': FRIES, 'sp-fromage': SAUCES, 'sp-sauce': SAUCES,
  'bs-canette': CANS, 'bs-soda-1l': SODA, 'bs-jus': JUICE, 'bs-eau': WATER,
}

const BY_CAT = {
  pizzas: P.margherita, sandwiches: SW.baguette, burgers: BG.gourmet, plats: PLAT.poulet, tacos: TACOS,
  poutine: POUT.loaded, kids: NUGGETS, supplements: FRIES, boissons: CANS,
}

export function itemImage(item) {
  if (!item) return null
  if (item.image) return { src: item.image }
  return BY_SKU[item.sku || item.id] || BY_CAT[item.category] || null
}
