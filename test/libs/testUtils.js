
function toArray(arrayLikeThing, startIndex, endIndex) {
   return Array.prototype.slice.call(arrayLikeThing, startIndex, endIndex);
}