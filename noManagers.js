Vue.component('tema', {
    props: ['type', 'url', 'name', 'date'],
    template: `
    <div class="rp-list">
        <a class="rp-element" :href="url" :title="'Ir al tema «' + name + '»'">
            <div class="rp-icon">
                <template v-if="type === 'abierto'">
                    <i class="fas fa-lock-open"></i>
                </template>
                <template v-else-if="type === 'cerrado'">
                    <i class="fas fa-lock"></i>
                </template>
                <template v-else-if="type === 'abandonado'">
                    <i class="fas fa-times"></i>
                </template>
            </div>
            <div class="rp-content">
                <div class="rp-name">
                    <span>{{ name }}</span>
                    <small>
                        {{ date }} - <slot></slot>
                    </small>
                </div>
            </div>
        </a>
    </div>
    `
});

Vue.component('relacion', {
    props: ['id', 'name', 'img', 'color'],
    data() {
        return {
            profileName: forumConfig.profileOptions.profileName || 'perfil'
        }
    },
    computed: {
        relaClass() {
            return 'rela-list usergroup-' + this.color.toLowerCase();
        },
        relaType() {
            return typeof this.id !== 'undefined';
        }
    },
    template: `
    <div :class="relaClass">
        <template v-if="relaType">
            <a class="rela-element" :href="'/u' + id" :title="'Ir al ' + profileName + ' de «' + name + '»'">
                <div class="rela-image" :style="'background-image: url(' + img + ')'"></div>
                <div class="rela-content">
                    <div class="rela-title">
                        <h4>{{ name }}</h4>
                    </div>
                    <div class="small-text is-content">
                        <slot></slot>
                    </div>
                </div>
            </a>
        </template>
        <template v-else>
            <a class="rela-element">
                <div class="rela-image" :style="'background-image: url(' + img + ')'"></div>
                <div class="rela-content">
                    <div class="rela-title">
                        <h4>{{ name }}</h4>
                    </div>
                    <div class="small-text is-content">
                        <slot></slot>
                    </div>
                </div>
            </a>
        </template>
    </div>
    `
});