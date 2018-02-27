import { applyDefaults as original } from '../../src/defaults';

var applyDefaults = jasmine.createSpy('applyDefaults').and.callFake(original.bind(original));

export { applyDefaults }