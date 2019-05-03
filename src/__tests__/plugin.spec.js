import { createLocalVue, shallowMount } from '@vue/test-utils';
import Vuex from "vuex";
import plugin from '../plugin';

describe('plugin', () => {
  it('should throw error if installed before new Vuex.Store is called', () => {
    const localVue = createLocalVue();
    expect(() => {
      localVue.use(plugin);
    }).toThrow();
  });

  it('should not throw error if installed after new Vuex.Store is called', () => {
    const localVue = createLocalVue();
    expect(() => {
      localVue.use(Vuex);
      new Vuex.Store({});
      localVue.use(plugin);
    }).not.toThrow();
  });

  it('should undo/redo data property', done => {
    const localVue = createLocalVue();
    localVue.use(Vuex);

    const store = new Vuex.Store({
      state: {
        elements: [
          {
            value: 0,
          },
        ],
      },
      mutations: {
        UPDATE(state, { index, oldValues, newValues }) {
          state.elements[index] = newValues;
        },
      },
    });

    localVue.use(plugin, {
      rules: [
        {
          from: 'UPDATE',
          to: 'UPDATE',
          mapPayload: { oldValues: 'newValues', newValues: 'oldValues' },
        },
      ],
    });

    const component = {
      template: "<div></div>",
      computed: {
        elements() {
          return this.$store.state.elements;
        },
      },
      methods: {
        update(index, newValues) {
          const oldValues = Object.assign({}, this.elements[index])
          this.$store.commit('UPDATE', { index, oldValues, newValues });
        }
      },
      created() {
        const index = 0;

        expect(this.elements[index].value).toBe(0);

        this.update(index, { value: 1 });
        expect(this.canRedo).toBe(false);
        expect(this.canUndo).toBe(true);
        expect(this.elements[index].value).toBe(1);

        this.undo();
        expect(this.canRedo).toBe(true);
        expect(this.elements[index].value).toBe(0);

        this.redo();
        expect(this.canRedo).toBe(false);
        expect(this.elements[index].value).toBe(1);
        
        done();
      }
    };
    shallowMount(component, {
      localVue,
      store
    });
  });
});
