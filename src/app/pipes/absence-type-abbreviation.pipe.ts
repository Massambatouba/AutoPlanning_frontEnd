import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'absenceTypeAbbreviation',
  standalone: true
})
export class AbsenceTypeAbbreviationPipe implements PipeTransform {

  private readonly abbreviations: Record<string, string> = {
    CONGE_PAYE: 'CP',
    CONGE_SANS_SOLDE: 'CSS',
    MALADIE: 'MLD',
    CONGE_PARENTAL: 'CP',
    ABSENCE_NON_JUSTIFIEE: 'ANJ',
    AUTRE: 'AUT'
  };

  transform(value: string | undefined | null): string {
    if (!value) return '';
    return this.abbreviations[value] ?? value;
  }

}
