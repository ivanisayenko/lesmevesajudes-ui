import {Person} from '../persons/PersonTypes';

export const esFill = (persona: Person) => persona.edat <= 16 || persona.es_escolaritzat_entre_P3_i_4rt_ESO;
export const esSustentador = (persona: Person) => persona.edat > 16
    && (persona.is_the_person_in_front_of_the_computer ||
        (typeof persona.relacio_parentiu === 'string' && persona.relacio_parentiu !== 'cap'));
export const esInfantAcollit = (persona: Person) => persona.rol === 'infant_acollit';
export const currentFocussedFieldSelector = (formName: string): Function => (state): ?string => (typeof state.form[formName] === 'undefined') ? undefined : state.form[formName].active;
export const personsByRelacioDeParentiu = (relacioDeParentiu: string, persones: Array<Person>) => persones.filter((person: Person) => person.relacio_parentiu === relacioDeParentiu);
