Vue.component('directorio-personajes', {
    data() {
        return {
            loading: true,
            config: forumConfig,
            logged: !document.querySelector('body').classList.contains('is-unknown'),
            busqueda: {
                name: '',
                faceClaim: '',
                ocupation: '',
                user: 'all',
                group: 'all',
            },
            characters: [],
            users: []
        }
    },
    computed: {
        directoryFields() {
            const fields = this.config.profileUser.directoryFields;

            if (this.logged) {
                fields.unshift('usuario');
            }

            return fields;
        },
        filteredCharacters() {
            if (!this.busqueda.name && !this.busqueda.faceClaim  && !this.busqueda.ocupation && this.busqueda.user === 'all' && this.busqueda.group === 'all') {
                return this.characters;
            }

            const nameLower = this.busqueda.name.toLowerCase();
            const faceClaimLower = this.busqueda.faceClaim.toLowerCase();
            const ocupationLower = this.busqueda.ocupation.toLowerCase();

            return this.characters.filter(character =>
                character.name.toLowerCase().includes(nameLower) && character.fields['face_claim'].content.toLowerCase().includes(faceClaimLower) && character.fields['ocupacion'].content.toLowerCase().includes(ocupationLower) && (this.busqueda.user === 'all' || character.fields['usuario'].content === this.busqueda.user) && (this.busqueda.group === 'all' || character.colour === forumConfig.profileUser.forumGroups[this.busqueda.group].group)
            );
        },
        availableUsers() {
            const users = new Set(this.characters.map(character => character.fields['usuario'].content));

            return Array.from(users).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
        },
        availableGroups() {
            const groups = new Set(this.characters.map(character => character.colour));

            return Object.values(this.config.profileUser.forumGroups).filter(group => groups.has(group.group)).sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
        }
    },
    methods: {
        async obtainCharacters() {
            let activeMembers;

            try {
                activeMembers = await FNR.cache.useData('members', 1);
            } catch (e) {
                activeMembers = null;
            }

            if (!activeMembers) {
                activeMembers = await FNR.forum.getMembers();
                FNR.cache.setData('members', activeMembers, 1);
            }

            const profiles = await Promise.allSettled(
                activeMembers.map(user => FNR.user.getProfile(user.id.replace('/u', ''), .5))
            );

            this.characters = profiles.filter(r => r.status === 'fulfilled').map(r => r.value);;
            this.loading = false;
        },
        updateParams(key, value) {
            const url = new URL(window.location.href)

            if (value) {
                url.searchParams.set(key, value)
            } else {
                url.searchParams.delete(key)
            }

            window.history.replaceState({}, '', url)
        },
        genSlug(text) {
            return FNR.utility.genSlug(text, '-');
        }
    },
    created() {
        this.obtainCharacters();
    },
    mounted() {
        document.title = 'Directorio';

        const url = new URL(window.location.href);

        if (url.searchParams.has('group')) {
            this.busqueda.group = url.searchParams.get('group');
        }

        if (url.searchParams.has('user') && this.logged) {
            this.busqueda.user = url.searchParams.get('user');
        } else if (url.searchParams.has('user')) {
            this.updateParams('user');
        }

        document.addEventListener('directoryReady', () => {
            FNR.behaviour.genMeassure();
        });
    },
    updated() {
        document.dispatchEvent(directoryReady);
    },
    template: `
        <section id="directory-section" class="basic-element">
            <section class="generic-element">
                <cabespecial-foro>
                    <template slot="title">Directorio</template>
                </cabespecial-foro>
                <section id="memberlist-options" class="field-block">
                    <ul class="forum-fieldlist no-style">
                        <li class="field-element field-nombre">
                            <div class="forum-field">
                                <div class="field-name">Nombre</div>
                                <div class="field-content">
                                    <input type="text" :disabled="busqueda.faceClaim !== '' || busqueda.ocupation !== ''" v-model="busqueda.name" placeholder="Buscar por Nombre.">
                                </div>
                            </div>
                        </li>
                        <li class="field-element field-faceclaim">
                            <div class="forum-field">
                                <div class="field-name">Face claim</div>
                                <div class="field-content">
                                    <input type="text" :disabled="busqueda.name !== '' || busqueda.ocupation !== ''" v-model="busqueda.faceClaim" placeholder="Buscar por Face Claim.">
                                </div>
                            </div>
                        </li>
                        <li class="field-element field-ocupation">
                            <div class="forum-field">
                                <div class="field-name">Ocupación</div>
                                <div class="field-content">
                                    <input type="text" :disabled="busqueda.faceClaim !== '' || busqueda.name !== ''" v-model="busqueda.ocupation" placeholder="Buscar por Ocupación.">
                                </div>
                            </div>
                        </li>
                        <li v-if="logged" class="field-element field-usuario">
                            <div class="forum-field">
                                <div class="field-name">Usuario</div>
                                <div class="field-content">
                                    <div class="select-container">
                                        <select v-model="busqueda.user" @change="busqueda.user !== 'all' ? updateParams('user', busqueda.user) : updateParams('user')">
                                            <option value="all" selected="selected">Todos</option>
                                            <option v-for="user in availableUsers" :key="user" :value="user">{{ user }}</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </li>
                        <li class="field-element field-group">
                            <div class="forum-field">
                                <div class="field-name">Grupo</div>
                                <div class="field-content">
                                    <div class="select-container">
                                        <select v-model="busqueda.group" @change="busqueda.group !== 'all' ? updateParams('group', busqueda.group) : updateParams('group')">
                                            <option value="all" selected="selected">Todos</option>
                                            <option v-for="group in availableGroups" :key="group.name" :value="genSlug(group.name)">{{ group.name }}</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </li>
                    </ul>
            		<div id="usereply-comand">
                        <button class="button2 btn-main" @click="busqueda.name = ''; busqueda.faceClaim = ''; busqueda.ocupation = ''; busqueda.user = 'all'; busqueda.group = 'all'; updateParams('group'); updateParams('user')">Reiniciar</button>
            		</div>
                </section>
                <separador-foro />
                <cabecera-foro>
                    <template slot="title">Listado</template>
                </cabecera-foro>
                <section v-if="!loading" class="forum-memberlist">
                        <ul :class="'memberlist-members no-style' + (filteredCharacters.length ? '' : ' no-results')">
                            <li v-if="!filteredCharacters.length">
                                <h6>No hay personajes que coincidan con la búsqueda</h6>
                            </li>
                            <li v-else v-for="character in filteredCharacters" :key="character.name" class="row">
                                <a :href="character.links.profile" :title="'Ir al ' + config.profileOptions.profileName + ' de «' + character.name + '»'" :class="'memberitem-element usergroup-' + character.colour">
                                    <div class="memberlist-name">
                                        <h3 class="is-tweakeable">
                                            <span class="is-measurable">{{ character.name }}</span>
                                        </h3>
                                    </div>
                                    <img :src="character.avatar" :alt="'Avatar de «' + character.name + '»'" class="memberlist-avatar">
                                    <ul class="memberlist-fields">
                                        <li v-for="field in directoryFields" :key="field" :class="'memberlist-field field-' + genSlug(character.fields[field].name)">
                                                <strong>{{ character.fields[field].name }}:</strong> {{ character.fields[field].content | twist-field }}
                                        </li>
                                    </ul>
                                </a>
                            </li>
                        </ul>
                </section>
                <cargando-foro v-else text="Cargando utilidad…"></cargando-foro>
            </section>
        </section>
    `
});