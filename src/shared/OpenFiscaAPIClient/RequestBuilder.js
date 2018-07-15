import type {Person, PersonID} from "../../persons/PersonTypes";
import {demarcacioDelCodiPostal, zonaDelCodiPostal} from "../CodisPostals";
import {serialize} from "../../persons/PersonsReducer";
import {create as createUUID} from '../UUID';
import {detectaFamiliesAPartirDeCustodies} from "../../family/detectaFamiliesAPartirDeCustodies";
import type {ResidenceData} from "../../residence/ResidenceTypes";
import {esInfantAcollit} from "../selectorUtils";
import type {SimulationData} from "../../results/FetchSimulationAction";
import {possiblesParellesDe} from "../../family/FamilyForm";

const currentMonth = value => ({'2017-01': value});
const lastYear = value => ({'2016': value});
const seleccionaFamiliarsFinsASegonGrau = (persons: Array<Person>) => persons.filter((persona: Person) => persona.relacio_parentiu !== 'cap' && persona.relacio_parentiu !== 'altres').map((persona: Person) => persona.id);
const allPersonsIDs = (persons: Array<Person>) => persons.map((persona: Person) => persona.id);
const esUnSustentadorConvivent = (sustentador: ?string) => typeof sustentador === 'string' && sustentador !== 'ningu_mes' && sustentador !== 'no_conviu';
const areThereAny016Families = (custodies) => custodies.constructor === Object && Object.keys(custodies).filter((custodiaID: string) => (esUnSustentadorConvivent(custodies[custodiaID].primer) || esUnSustentadorConvivent(custodies[custodiaID].segon))).length > 0;
const seleccionaNoFamiliarsFinsASegonGrau = (persons: Array<Person>) => persons.filter((persona: Person) => persona.relacio_parentiu === 'cap' || persona.relacio_parentiu === 'altres').map((persona: Person) => persona.id);

const seleccionaElsAltresMembresDeLaUnitatDeConvivenciaQueSiguinFamiliarsFinsASegonGrau =
    (family016Members: Array<PersonID>, persons: Array<Person>) =>
        seleccionaFamiliarsFinsASegonGrau(persons).filter((personaID: PersonID) => family016Members.indexOf(personaID) === -1);

function afegeixSustentadorsSenseCustodia(persones, parelles) {
  return (familia) => {
    if (familia.monoparental) {
      const sustentador = familia.sustentadors[0];

      familia.sustentadors = [sustentador, typeof parelles[sustentador] !== 'undefined' ? parelles[sustentador] : possiblesParellesDe(sustentador, persones)[0]]

    } else return familia;
  }
}

const buildOpenFiscaFamiliesFromCustodies = (custodies, persons, families) => {
  const familiesFromCustodies = detectaFamiliesAPartirDeCustodies(custodies, persons);
  console.log("familiesFromCustodies: ", familiesFromCustodies);
  const families016 = familiesFromCustodies.map(afegeixSustentadorsSenseCustodia(persons, families.parelles));
  console.log("fmilies 016: ", families016);
  return Object.keys(families016).reduce((result, familiaID) => {
    const IDsFamilia016 = [...families016[familiaID].sustentadors, ...families016[familiaID].menors];
    const carnetMonoparental =
        typeof(families.disposa_de_carnet_familia_monoparental) !== 'undefined'
        && typeof(families.disposa_de_carnet_familia_monoparental[familiaID]) !== 'undefined'
        && families.disposa_de_carnet_familia_monoparental[familiaID]
            ? 'general' : 'nop';

    result[familiaID] = {
      adults: families016[familiaID].sustentadors,
      menors: families016[familiaID].menors,
      altres_persones: seleccionaNoFamiliarsFinsASegonGrau(serialize(persons)),
      altres_familiars: seleccionaElsAltresMembresDeLaUnitatDeConvivenciaQueSiguinFamiliarsFinsASegonGrau(
          IDsFamilia016,
          serialize(persons)),
      es_usuari_serveis_socials: currentMonth(families.usuari_serveis_socials[familiaID]),
      tipus_familia_monoparental: currentMonth(carnetMonoparental),
      tipus_custodia: currentMonth(families016[familiaID].tipus_custodia)
    };
    return result;
  }, {});
};

const createAFamilyWithAllPersons = (simulationData) => {
  const id = createUUID();
  let result = {};
  result[id] = {
    altres_persones: seleccionaNoFamiliarsFinsASegonGrau(serialize(simulationData.persons)),
    altres_familiars: seleccionaElsAltresMembresDeLaUnitatDeConvivenciaQueSiguinFamiliarsFinsASegonGrau(
        [],
        serialize(simulationData.persons))
  };
  return result;
};

const residenceDataToAPI = (residenceData: ResidenceData) => ({
  codi_postal_habitatge: currentMonth(residenceData.codi_postal_habitatge),
  demarcacio_de_lhabitatge: currentMonth(residenceData.demarcacio_de_lhabitatge),
  des_de_quan_teniu_deutes_de_lloguer: currentMonth(residenceData.des_de_quan_teniu_deutes_de_lloguer),
  existeix_deute_en_el_pagament_del_lloguer: currentMonth(residenceData.existeix_deute_en_el_pagament_del_lloguer),
  existeix_deute_en_el_pagament_de_la_hipoteca: currentMonth(residenceData.existeix_deute_en_el_pagament_de_la_hipoteca),
  fa_mes_de_12_mesos_que_existeix_el_deute_de_hipoteca: currentMonth(residenceData.fa_mes_de_12_mesos_que_existeix_el_deute_de_hipoteca),
  ha_pagat_almenys_3_quotes_del_lloguer: currentMonth(residenceData.ha_pagat_almenys_3_quotes_del_lloguer),
  ha_perdut_lhabitatge_en_els_ultims_2_anys: currentMonth(residenceData.ha_perdut_lhabitatge_en_els_ultims_2_anys),
  ha_pagat_12_mesos_daquesta_hipoteca: currentMonth(residenceData.ha_pagat_12_mesos_daquesta_hipoteca),
  ha_participat_en_un_proces_de_mediacio: currentMonth(residenceData.ha_participat_en_un_proces_de_mediacio),
  import_del_lloguer: currentMonth(residenceData.import_del_lloguer),
  import_de_la_hipoteca: currentMonth(residenceData.import_de_la_hipoteca),
  relacio_de_parentiu_amb_el_propietari: currentMonth(residenceData.relacio_de_parentiu_amb_el_propietari),
  tinc_alguna_propietat_a_part_habitatge_habitual_i_disposo_dusdefruit: currentMonth(residenceData.tinc_alguna_propietat_a_part_habitatge_habitual_i_disposo_dusdefruit),
  zona_de_lhabitatge: currentMonth(residenceData.zona_de_lhabitatge),
  HA_001: currentMonth(null),
  HA_002: currentMonth(null),
  HA_003: currentMonth(null),
  HA_004: currentMonth(null),
  HA_005: currentMonth(null),
});

const createUnitatDeConvivencia = (simulationData) => {
  const id = createUUID();
  let result = {};
  result[id] = {
    persones_que_conviuen: allPersonsIDs(serialize(simulationData.persons)),
    ...residenceDataToAPI(simulationData.residence),
  };
  return result;
};

const personToOpenFiscaPerson = (person: Person) => ({
  anys_empadronat_a_barcelona: currentMonth(person.anys_empadronat_a_barcelona),
  beneficiari_de_prestacio_residencial: currentMonth(person.beneficiari_de_prestacio_residencial),
  edat: currentMonth(person.edat),
  en_acolliment: currentMonth(esInfantAcollit(person)),
  en_els_ultims_12_mesos_ha_fet_baixa_voluntaria_de_la_feina: currentMonth(
      person.en_els_ultims_12_mesos_ha_fet_baixa_voluntaria_de_la_feina
  ),
  es_escolaritzat_entre_P3_i_4rt_ESO: currentMonth(person.es_escolaritzat_entre_P3_i_4rt_ESO),
  es_orfe_dels_dos_progenitors: currentMonth(person.es_orfe_dels_dos_progenitors),
  es_divorciada_de_familia_reagrupada: currentMonth(person.es_una_persona_divorciada && person.membre_de_familia_reagrupada),
  grau_discapacitat: currentMonth(person.grau_discapacitat),
  ha_esgotat_prestacio_de_desocupacio: currentMonth(!person.gaudeix_de_prestacio_contributiva_o_subsidi_desocupacio),
  ha_treballat_a_l_estranger_6_mesos: currentMonth(person.ha_treballat_a_l_estranger_6_mesos),
  ha_treballat_a_l_estranger_6_mesos_i_ha_retornat_en_els_ultims_12_mesos: currentMonth(
      person.ha_treballat_a_l_estranger_6_mesos_i_ha_retornat_en_els_ultims_12_mesos
  ),
  ingressos_bruts: lastYear(person.ingressos_bruts),
  ingressos_per_pnc: lastYear(person.ingressos_per_pnc),
  inscrit_com_a_demandant_docupacio: currentMonth(person.inscrit_com_a_demandant_docupacio),
  inscrit_com_a_demandant_docupacio_mes_de_12_mesos: currentMonth(person.inscrit_com_a_demandant_docupacio_mes_de_12_mesos),
  municipi_empadronament: currentMonth(person.municipi_empadronament),
  percep_prestacions_incompatibles_amb_la_feina: currentMonth(person.percep_prestacions_incompatibles_amb_la_feina),
  porta_dos_anys_o_mes_empadronat_a_catalunya: currentMonth(person.porta_dos_anys_o_mes_empadronat_a_catalunya),
  sexe: currentMonth(person.sexe),
  situacio_laboral: currentMonth(person.situacio_laboral),
  tipus_document_identitat: currentMonth(person.tipus_document_identitat),
  victima_violencia_de_genere: currentMonth(person.victima_violencia_de_genere),
  victima_violencia_domestica: currentMonth(person.victima_violencia_domestica),
  AE_230_mensual: currentMonth(null),
  AE_230_01_mensual: currentMonth(null),
  EG_233_mensual: currentMonth(null),
  GE_051_00_mensual: currentMonth(null),
  GE_051_01_mensual: currentMonth(null),
  GE_051_02_mensual: currentMonth(null),
  GE_051_03_mensual: currentMonth(null),
  GG_270_mensual: currentMonth(null)
});

export const buildRequest = (simulationData: SimulationData) => {
  const personalData = simulationData.persons.reduce(
      (acc, person: Person) => {
        acc[person.id] = personToOpenFiscaPerson(person);
        return acc;
      },
      {}
  );

  if (typeof simulationData.residence.titular_contracte_de_lloguer_id === 'string' && typeof personalData[simulationData.residence.titular_contracte_de_lloguer_id] === 'object') {
    personalData[simulationData.residence.titular_contracte_de_lloguer_id].titular_contracte_de_lloguer = currentMonth(true);
    personalData[simulationData.residence.titular_contracte_de_lloguer_id].temps_empadronat_habitatge_actual = currentMonth(simulationData.residence.titular_contracte_lloguer_temps_empadronat);
  }

  if (typeof simulationData.residence.titular_hipoteca_id === 'string' && typeof personalData[simulationData.residence.titular_hipoteca_id] === 'object') {
    personalData[simulationData.residence.titular_hipoteca_id].titular_hipoteca = currentMonth(true);
    personalData[simulationData.residence.titular_hipoteca_id].temps_empadronat_habitatge_actual = currentMonth(simulationData.residence.titular_hipoteca_temps_empadronat);

  }

  simulationData.residence.zona_de_lhabitatge = zonaDelCodiPostal(simulationData.residence.codi_postal_habitatge);
  simulationData.residence.demarcacio_de_lhabitatge = demarcacioDelCodiPostal(simulationData.residence.codi_postal_habitatge);

  const families = areThereAny016Families(simulationData.family.custodies)
      ? buildOpenFiscaFamiliesFromCustodies(simulationData.family.custodies, simulationData.persons, simulationData.family)
      : createAFamilyWithAllPersons(simulationData);

  const unitatsDeConvivencia = createUnitatDeConvivencia(simulationData);

  return {
    families: families,
    persones: {...personalData},
    unitats_de_convivencia: unitatsDeConvivencia
  };
};