module.exports = {
  install(Vue, options = {}) {
    if (!Vue._installedPlugins.find(plugin => plugin.Store)) {
      throw new Error("VuexUndoRedo plugin must be installed after the Vuex plugin.")
    }
    Vue.mixin({
      data() {
        return {
          done: [],
          undone: [],
          newMutation: true,
          rules: options.rules || [],
        };
      },
      created() {
        if (this.$store) {
          this.$store.subscribe(mutation => {
            const inRules = (this.rules
              .findIndex(rule => rule.from === mutation.type) !== -1);
            if (inRules) this.done.push(mutation);
            if (this.newMutation) this.undone = [];
          });
        }
      },
      computed: {
        canRedo() {
          return this.undone.length;
        },
        canUndo() {
          return this.done.length;
        }
      },
      methods: {
        redo() {
          let commit = this.undone.pop();
          this.newMutation = false;
          switch (typeof commit.payload) {
            case 'object':
              this.$store.commit(`${commit.type}`, Object.assign({}, commit.payload));
              break;
            default:
              this.$store.commit(`${commit.type}`, commit.payload);
          }
          this.newMutation = true;
        },
        undo() {
          const commit = this.done.pop();
          const rule = this.rules.find(rule => rule.from === commit.type);

          this.undone.push(commit);
          this.newMutation = false;

          let payload;
          switch (typeof commit.payload) {
            case 'object': {
              payload = Object.assign({}, commit.payload);
              if (Object.prototype.hasOwnProperty.call(rule, 'mapPayload')) {
                const newPayload = {};
                for (const [key, value] of Object.entries(rule.mapPayload)) {
                  newPayload[key] = payload[value];
                }
                payload = newPayload;
              }
              break;
            }
            default: {
              payload = commit.payload;
            }
          }

          this.$store.commit(rule.to, payload);
          this.newMutation = true;
        },
        reset() {
          this.undone = [];
          this.done = [];
        },
      },
    });
  },
}
