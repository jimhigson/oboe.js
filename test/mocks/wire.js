import { wire as original } from '../../src/wire'

var wire = jasmine.createSpy('wire').and.callFake(original.bind(original))

export { wire }
