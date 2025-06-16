import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'agentTypeAbbreviation',
  standalone: true
})
export class AgentTypeAbbreviationPipe implements PipeTransform {

  private readonly abbreviations: Record<string, string> = {
    ADS_Filtrage: 'J01',
    ADS_Agent_Securite: 'J02',
    SSIAP1: 'SSIAP1',
    SSIAP2: 'SSIAP2',
    SSIAP3: 'SSIAP3',
    CHEF_DE_POSTE: 'CHF_P',
    CHEF_DE_EQUIPE: 'CHF_E',
    RONDIER: 'ROND',
    ASTREINTE: 'ASTR',
    FORMATION: 'F'
  };

  transform(value: string | undefined | null): string {
    if (!value) return '';
    return this.abbreviations[value] || value;
  }

}
