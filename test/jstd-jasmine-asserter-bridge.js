/*
 * Before I used Karma/Jasmine I used JS Test Driver for the tests but I switched because
 * it was too unstable.
 * 
 * JSTD provided a fail method to finish the test right away, emulate this by throwing an
 * exception.
 */

function fail(message) {
   throw new Error(message);
}
