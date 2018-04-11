//@flow
import React from 'react';
import {addHouseholdData} from './HouseholdDataActions';
import {connect} from 'react-redux';
import type {HouseholdData} from "./HouseholdDataTypes";
import {Select, Checkbox} from 'redux-form-material-ui';
import {Field, reduxForm} from 'redux-form';
import {MenuItem, Grid} from "material-ui";
import {Adult} from "../adults/AdultsTypes";
import type {AdultId} from "../adults/AdultsTypes";
import {Map} from 'immutable';
import {esFamiliaNombrosa, esFill, esSustentador} from "../shared/selectorUtils";
import DescriptionText from "../components/Common/DescriptionText"

type Props = {
  initialValues: HouseholdData,
  addHouseholdData: Function,
  esUsuariServeisSocials: Boolean,
  esMonoparental: Boolean,
  esFamiliaNombrosa: Boolean,
  fills: Map<AdultId, Adult>,
  custodies: Object
};

let HouseholdForm = (props: Props) => {
  const {esMonoparental, esFamiliaNombrosa, fills, custodies} = props;
  return (
      <Grid container className="bg-container">
        <h1>Informació sobre el tipus de família</h1>
        <Grid container direction={'row'} justify={'space-around'}>
          <Grid item xs sm={5}>
            <form name='HouseholdForm'>
              {esFamiliaNombrosa &&
              <Grid item>
                <label>Tipus familia nombrosa:</label>
                <Field name='tipus_familia_nombrosa' component={Select} fullWidth>
                  <MenuItem value="No">No</MenuItem>
                  <MenuItem value="General">General</MenuItem>
                  <MenuItem value="Especial">Especial</MenuItem>
                </Field>
              </Grid>}

              {esMonoparental &&
              <Grid item>
                <label>Disposa del carnet de familia monoparental:</label>
                <Field name='tipus_familia_monoparental' component={Select} fullWidth>
                  <MenuItem value="No">No</MenuItem>
                  <MenuItem value="General">General</MenuItem>
                  <MenuItem value="Especial">Especial</MenuItem>
                </Field>
              </Grid>}
              {esMonoparental &&
              fills.valueSeq().map((infant: Adult) =>
                  <Grid item key={infant.id}>
                    <label><Field name={"custodies." + infant.id + ".existeix"} component={Checkbox}/>
                      Tinc la custodia de {infant.nom}</label>
                    {(custodies !== null && custodies[infant.id] !== null) &&
                    <Grid item>
                      <label>Tipus de guardia i custodia:</label>
                      <Field name={'custodies.' + infant.id + '.tipus'} component={Select} fullWidth>
                        <MenuItem value="compartida">Compartida</MenuItem>
                        <MenuItem value="total">Total</MenuItem>
                      </Field>
                    </Grid>}
                  </Grid>)

              }
              <label>
                <Field data-test="es_usuari_serveis_socials" name="es_usuari_serveis_socials" component={Checkbox}/>
                Família usuaria de serveis socials en seguiment a un CSS o servei especialitzat de l'Ajuntament de
                Barcelona
              </label>
            </form>
          </Grid>
          <Grid item xs sm={5} hidden={{smDown: true}}>
            <DescriptionText/>
          </Grid>
        </Grid>
      </Grid>
  );
};

function mapStateToProps(state) {
  return {
    initialValues: state.household,
    esMonoparental: state.adults.filter((persona: Adult) => esSustentador(persona)).count() === 1,
    esFamiliaNombrosa: esFamiliaNombrosa(state.adults),
    fills: state.adults.filter((adult: Adult) => esFill(adult)),
    custodies: state.household.custodies
  };
}

export default connect(mapStateToProps, {addHouseholdData})(
    reduxForm(
        {
          form: 'HouseholdForm',
          onChange: (values, dispatch) => {
            dispatch(addHouseholdData(values));
          }
        })(HouseholdForm));
