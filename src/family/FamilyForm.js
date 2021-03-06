//@flow
import React, {Fragment} from 'react';
import {addFamilyData} from './FamilyDataActions';
import {connect} from 'react-redux';
import type {FamilyData} from './FamilyDataTypes';
import {Select} from 'redux-form-material-ui';
import {reduxForm} from 'redux-form';
import Grid from '@material-ui/core/Grid';
import MenuItem from '@material-ui/core/MenuItem';
import type {Person, PersonID} from '../persons/PersonTypes';
import {Map} from 'immutable';
import {
  currentFocussedFieldSelector,
  esFill,
  esSustentador,
  personsByRelacioDeParentiu,
} from '../shared/selectorUtils';
import DescriptionText from '../components/Common/DescriptionText';
import {Trans} from 'react-i18next';
import Typography from '@material-ui/core/Typography';
import {YesNoQuestion} from '../persons/components/YesNoQuestion';
import FormSubTitle from '../persons/components/FormSubTitle';
import {detectaFamiliesAPartirDeCustodies} from './detectaFamiliesAPartirDeCustodies';
import {createFamilyName, toArray} from './createFamilyName';
import Sticky from 'react-stickynode';
import {IconFont} from '../components/IconFont/IconFont';
import {IRemoveMyValueWhenUnmountedField} from "../components/IRemoveMyValueWhenUnmountedField";

type Props = {
  addHouseholdData: Function,
  currentField: string,
  custodies: Object,
  esFamiliaNombrosa: boolean,
  esUsuariServeisSocials: boolean,
  families: Array<Object>,
  fills: Map<PersonID, Person>,
  initialValues: FamilyData,
  persones: Map<PersonID, Person>,
  possiblesSustentadors: Map<PersonID, Person>,
  sustentadorsSolitarisAmbPossiblesParelles: Map<Person, Array<Person>>
};

const FamilyForm = (props: Props) => {
  const {currentField, custodies, families, fills, persones, possiblesSustentadors, sustentadorsSolitarisAmbPossiblesParelles} = props;
  console.log("sustentadorsiparelles:", sustentadorsSolitarisAmbPossiblesParelles);
  return (
      <Grid container className='bg-container'>
        <Grid item xs={12} sm={12} className='titleContainer'>
          <Typography variant='headline' className='titlePage'>
            <IconFont icon='familia' sizeSphere={48} fontSize={32}/>
            <span className='titleText'><Trans>Informació sobre la família</Trans></span>
          </Typography>
        </Grid>
        <Grid item xs={12} className='bg-form-exterior bg-form formMinHeight'>
          <form name='FamilyForm'>
            <Grid container direction='row' justify='space-around' alignItems='stretch' spacing={16}>
              <Grid item xs={12} sm={6}>
                <Grid container direction='column' alignItems='stretch' spacing={16}>
                  {fills.valueSeq().map((infant: Person) =>
                      <Grid item xs={12} key={infant.id}>

                        <label>
                          <Typography gutterBottom>
                            <Trans>Qui té la guarda i custòdia o tutela legal de: </Trans><b>{infant.nom}</b>
                          </Typography>
                        </label>
                        <Grid container direction='row' justify='space-between'>
                          <Grid item xs={5}>
                            <IRemoveMyValueWhenUnmountedField name={'custodies.' + infant.id + '.primer'} component={Select} fullWidth>
                              {possiblesSustentadors.valueSeq().map((sustentador: Person) =>
                                  <MenuItem key={`primer-${sustentador.id}`} value={sustentador.id}>
                                    {sustentador.nom} ({sustentador.edat} <Trans>anys</Trans>)
                                  </MenuItem>
                              )}
                              <MenuItem value='no_conviu'><Trans>Una persona que no conviu</Trans></MenuItem>
                            </IRemoveMyValueWhenUnmountedField>
                          </Grid>
                          <Grid item xs={1}>
                            <Typography className='andSeparator'><Trans>i</Trans></Typography>
                          </Grid>
                          <Grid item xs={5}>
                            <IRemoveMyValueWhenUnmountedField name={'custodies.' + infant.id + '.segon'} component={Select} fullWidth>
                              {possiblesSustentadors.valueSeq().map((sustentador: Person) =>
                                  typeof custodies[infant.id] !== 'undefined' && custodies[infant.id].primer === sustentador.id
                                      ? null
                                      : <MenuItem key={`segon-${sustentador.id}`} value={sustentador.id}>
                                        {sustentador.nom} ({sustentador.edat} <Trans>anys</Trans>)
                                      </MenuItem>
                              )}
                              <MenuItem value='no_conviu'><Trans>Una persona que no conviu</Trans></MenuItem>
                              <MenuItem value='ningu_mes'><Trans>Ningú més</Trans></MenuItem>
                            </IRemoveMyValueWhenUnmountedField>
                          </Grid>
                        </Grid>

                      </Grid>)}
                  {families.length > 0 &&
                  families.map((familia) =>
                      <Fragment key={familia.ID}>
                        <FormSubTitle><Trans>Família de: </Trans> {createFamilyName(familia, persones)} </FormSubTitle>
                        { // $FlowFixMe
                          typeof sustentadorsSolitarisAmbPossiblesParelles[familia.sustentadors_i_custodia[0]] !== 'undefined' &&
                          // $FlowFixMe
                          sustentadorsSolitarisAmbPossiblesParelles[familia.sustentadors_i_custodia[0]].length > 1 &&
                          <Fragment>
                            <label>
                              <Typography gutterBottom>
                                <Trans>Existeix una parella
                                  de: </Trans><b>{persones.get(familia.sustentadors_i_custodia[0]).nom}</b>
                              </Typography>
                            </label>
                            <IRemoveMyValueWhenUnmountedField name={'parelles.' + familia.sustentadors_i_custodia[0]}
                                                              component={Select} fullWidth>
                              {// $FlowFixMe
                                sustentadorsSolitarisAmbPossiblesParelles[familia.sustentadors_i_custodia[0]].map((possibleParella: Person) =>
                                    <MenuItem
                                        key={`parella-${familia.sustentadors_i_custodia[0]}-${possibleParella.id}`}
                                              value={possibleParella.id}>
                                      {possibleParella.nom} ({possibleParella.edat})
                                    </MenuItem>
                                )}
                              <MenuItem key='no-en-te' value='no-en-te'>No en té</MenuItem>
                            </IRemoveMyValueWhenUnmountedField>
                          </Fragment>
                        }
                        {familia.monoparental &&
                        <YesNoQuestion name={'disposa_de_carnet_familia_monoparental.' + familia.ID}>
                          <Trans>Té el carnet de família monoparental?</Trans>
                        </YesNoQuestion>}

                        <YesNoQuestion name={'usuari_serveis_socials.' + familia.ID}>
                          <Trans>Aquesta família és usuària de serveis socials en seguiment a un CSS o servei
                            especialitzat de l'Ajuntament de Barcelona des d'abans del 31/12/2017?</Trans>
                        </YesNoQuestion>
                      </Fragment>
                  )}
                </Grid>
              </Grid>
              <Grid item xs sm={5}>
                <Sticky enabled={true} top={10} bottomBoundary='.bg-container'>
                  <DescriptionText currentField={currentField}/>
                </Sticky>
              </Grid>
            </Grid>
          </form>
        </Grid>

      </Grid>
  );
};

export function possiblesParellesDe(person: Person, persons: Map<PersonID, Person>): Array<Person> {
  switch (person.relacio_parentiu) {
    case undefined:
      return personsByRelacioDeParentiu('parella', persons);
    case 'fill':
      return personsByRelacioDeParentiu('gendre', persons);
    case 'germa':
      return personsByRelacioDeParentiu('cunyat', persons);
    default:
      return [];
  }
}

export function sustentadorsSolitarisIPossiblesParelles(sustentadors: Array<Person>, persones: Map<PersonID, Person>) {
  return sustentadors.reduce((result, current) => {
    // $FlowFixMe
    result[current.id] = possiblesParellesDe(current, persones);
    return result;
  }, {})
}

function mapStateToProps(state) {
  const currentField = currentFocussedFieldSelector('FamilyForm')(state);
  const custodies = typeof state.family.custodies !== 'undefined' ? state.family.custodies : {};
  const families = toArray(detectaFamiliesAPartirDeCustodies(custodies, state.persons));
  const familiesMonoparentals = families.filter((familia) => familia.monoparental);
  const sustentadorsUnicsIDs = familiesMonoparentals.map((familia) => familia.sustentadors_i_custodia[0]);
  const sustentadorsSolitaris = state.persons.filter((person: Person) => sustentadorsUnicsIDs.includes(person.id));
  const sustentadorsSolitarisAmbPossiblesParelles = sustentadorsSolitarisIPossiblesParelles(sustentadorsSolitaris, state.persons);
  return {
    currentField: currentField,
    custodies: custodies,
    families: families,
    fills: state.persons.filter((person: Person) => esFill(person)),
    initialValues: state.family,
    persones: state.persons,
    possiblesSustentadors: state.persons.filter((person: Person) => esSustentador(person)),
    sustentadorsSolitarisAmbPossiblesParelles: sustentadorsSolitarisAmbPossiblesParelles
  };
}

export default connect(mapStateToProps, {addHouseholdData: addFamilyData})(
    reduxForm(
        {
          form: 'FamilyForm',
          onChange: (values, dispatch) => {
            dispatch(addFamilyData(values));
          }
        })(FamilyForm));
