export function toSlug(str) {
  return str
    .toLowerCase()
    .replace(/[а-яёїіє]/g, c => ({ 'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ж':'zh','з':'z','и':'y','й':'j','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'kh','ц':'ts','ч':'ch','ш':'sh','щ':'shch','ь':'','ю':'yu','я':'ya','ї':'yi','і':'i','є':'ye','ё':'yo' }[c] || c))
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function getProductSlug(product) {
  return product.slug || toSlug(product.name || product.id)
}
