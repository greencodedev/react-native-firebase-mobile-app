import {Store} from '../../../../../src/stores/store'

test('The initial variables should be empty',()=>{
	const store = new Store();
	expect(store.user).toBe(null);
});
