import React from 'react';
import {Map} from 'immutable';
import type {PersonID} from '../persons/PersonTypes';
import {Person} from '../persons/PersonTypes';
import {Grid, Typography} from '@material-ui/core';
import {Trans} from 'react-i18next';
import BenefitRow, {NoBenefitRow} from './BenefitRow';

type PersonalBenefitsProps = {
  benefitsForPersons: any,
  persons: Map<PersonID, Person>
};

class PersonalBenefits extends React.Component<PersonalBenefitsProps> {
  constructor() {
    super();
    this.possibleBenefits = [
      {
        ID: 'AE_230_mensual',
        name: <Trans>Fons extraordinari d’ajuts d’emergència social per a infants de 0 a 16 anys</Trans>,
        periode: 'mes',
        url: '/ajuts/fons_infancia',
        from: new Date(2018, 4, 25, 0, 0, 0, 0),
        to: new Date(2018, 5, 25, 0, 0, 0, 0)
      },
      {
        ID: 'AE_230_01_mensual',
        name: <Trans>Fons extraordinari d’ajuts d’emergència social per a infants de 0 a 16 anys per a famílies
          monoparentals</Trans>,
        periode: 'any',
        url: '/ajuts/fons_infancia',
        from: new Date(2018, 4, 25, 0, 0, 0, 0),
        to: new Date(2018, 5, 25, 0, 0, 0, 0)
      },
      {
        ID: 'EG_233_mensual',
        name: <Trans>Ajuts de menjador escolar</Trans>,
        periode: 'dia',
        url: '/ajuts/menjador',
        from: new Date(2018, 9, 3, 0, 0, 0, 0),
        to: new Date(2018, 9, 14, 0, 0, 0, 0)
      },
      {
        ID: 'GE_051_00_mensual',
        name: <Trans>Renda activa d'inserció aturats de llarga durada</Trans>,
        periode: 'mes',
        url: '/ajuts/rai',
        from: undefined,
        to: undefined
      },
      {
        ID: 'GE_051_01_mensual',
        name: <Trans>Renda activa d'inserció discapacitat 33%</Trans>,
        periode: 'mes',
        url: '/ajuts/rai'
      },
      {
        ID: 'GE_051_02_mensual',
        name: <Trans>Renda activa d'inserció per a emigrants retornats</Trans>,
        periode: 'mes',
        url: '/ajuts/rai',
        from: undefined,
        to: undefined
      },
      {
        ID: 'GE_051_03_mensual',
        name: <Trans>Renda activa d'inserció per a víctimes de violència de gènere o domèstica</Trans>,
        periode: 'mes',
        url: '/ajuts/rai',
        from: undefined,
        to: undefined
      },
      {
        ID: 'GG_270_mensual',
        name: <Trans>Renda garantida ciutadana</Trans>,
        periode: 'mes',
        url: '/ajuts/rgc',
        from: undefined,
        to: undefined,
      }
    ];
    this.period = '2017-01';
  }

  hasAnyBenefit(personWithBenefits) {
    if (typeof personWithBenefits === 'undefined') return false; //TODO hackish. this happends due some inconsistency in the request processing. On
    return (
        this.possibleBenefits.reduce((acc, benefit) => {
          return acc + personWithBenefits[benefit.ID][this.period];
        }, 0) > 0
    );
  }

  renderAPersonalBenefit(benefit, personWithBenefits) {
    if (personWithBenefits[benefit.ID][this.period] > 0) {
      return (
          <BenefitRow benefit={benefit} subject={personWithBenefits} key={benefit.ID}/>
      );
    }
  }

  renderPersonalBenefits(person: Person, personBenefits: any) {
    return (
        <li className='ItemResultOut' key={person.id}>
          <Typography variant='subheading' gutterBottom className="titleResultPerson">
            Ajudes a les que podria ser beneficiàri/a: <b>{person.nom}</b>
          </Typography>

          <Grid container className='ItemList'>
            {(this.hasAnyBenefit(personBenefits))
                ? this.possibleBenefits.map(benefit => this.renderAPersonalBenefit(benefit, personBenefits))
                : <NoBenefitRow/>
            }
          </Grid>
        </li>
    );
  }

  renderPersonalBenefitList(
      personsData: Map<PersonID, Person>,
      personsWithBenefits: any
  ) {
    return (
        <Grid className='ResultList'>
          {personsData
              .valueSeq()
              .map((person: Person) =>
                  this.renderPersonalBenefits(person, personsWithBenefits[person.id])
              )}
        </Grid>
    );
  }

  render() {
    return (
        <Grid className='ResultList'>
          {this.props.persons
              .valueSeq()
              .map((person: Person) =>
                  this.renderPersonalBenefits(person, this.props.benefitsForPersons[person.id])
              )}
        </Grid>
    );
  }
}

export default PersonalBenefits;
