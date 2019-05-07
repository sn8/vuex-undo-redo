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
            if (inRules) {
              this.done.push(Object.assign({}, mutation));
              if (this.newMutation) this.undone = [];
            }
          });
        }
      },
      computed: {
        canRedo() {
          return this.undone.length > 0;
        },
        canUndo() {
          return this.done.length > 0;
        }
      },
      methods: {
        redo() {
          let commit = this.undone.pop();
          this.newMutation = false;
          commit.payload.isRedo = true;
          this.$store.commit(commit.type, commit.payload);
          this.newMutation = true;
        },
        undo() {
          const commit = this.done.pop();
          const rule = this.rules.find(rule => rule.from === commit.type);

          this.undone.push(commit);
          this.newMutation = false;

          switch (typeof commit.payload) {
            case 'object': {
              const payload = Object.assign({}, commit.payload);
              if (Object.prototype.hasOwnProperty.call(rule, 'mapPayload')) {
                for (const [key, value] of Object.entries(rule.mapPayload)) {
                  payload[key] = typeof commit.payload[value] === 'object'
                    ? Object.assign({}, commit.payload[value])
                    : commit.payload[value];
                }
              }
              payload.isUndo = true;
              this.$store.commit(rule.to, payload);
              break;
            }
            default: {
              this.$store.commit(rule.to, commit.payload);
            }
          }
          this.done.pop();
          this.newMutation = true;
        },
        resetUndoRedo() {
          this.undone = [];
          this.done = [];
        },
      },
    });
  },
}
