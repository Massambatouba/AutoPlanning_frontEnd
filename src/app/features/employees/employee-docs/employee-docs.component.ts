import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type DocCategory = 'IDENTITE' | 'DIPLOME';
type DocType =
  | 'CNI' | 'PASSEPORT' | 'PERMIS_SEJOUR'
  | 'CQP' | 'SSIAP1' | 'SSIAP2' | 'SSIAP3' | 'SST';

export interface DraftDoc {
  category: DocCategory;
  type: DocType;
  number?: string;
  expiryDate?: string; // yyyy-MM-dd
  file?: File | null;
}

@Component({
  standalone: true,
  selector: 'app-employee-docs',
  templateUrl: './employee-docs.component.html',
  styleUrls: ['./employee-docs.component.scss'],
  imports: [CommonModule, FormsModule],
})
export class EmployeeDocsComponent {
  // Identité (OBLIGATOIRE)
  identityKinds: DocType[] = ['CNI','PASSEPORT','PERMIS_SEJOUR'];
  idType: DocType = 'CNI';
  idNumber = '';
  idExpiresAt = '';
  idFile?: File | null;

  // Diplômes (au moins 1 requis)
  diplomaKinds: DocType[] = ['CQP','SSIAP1','SSIAP2','SSIAP3','SST'];
  dipType: DocType = 'CQP';
  dipNumber = '';
  dipExpiresAt = '';
  dipFile?: File | null;

  diplomas: DraftDoc[] = [];

  showErrors = false;

  // --- Upload inputs
  onIdFileChange(e: Event) {
    const input = e.target as HTMLInputElement;
    this.idFile = input.files?.[0] ?? null;
  }
  onDipFileChange(e: Event) {
    const input = e.target as HTMLInputElement;
    this.dipFile = input.files?.[0] ?? null;
  }

  // --- Diplôme CRUD
  addDiploma() {
    // Saisie minimale : type (déjà présent) ; on force aussi numéro/expiration si tu veux.
    this.diplomas.push({
      category: 'DIPLOME',
      type: this.dipType,
      number: this.dipNumber || undefined,
      expiryDate: this.dipExpiresAt || undefined,
      file: this.dipFile || null,
    });
    this.dipNumber = '';
    this.dipExpiresAt = '';
    this.dipFile = null;
  }

  deleteDiploma(d: DraftDoc) {
    this.diplomas = this.diplomas.filter(x => x !== d);
  }

  // --- Validation (appelée par le parent avant submit global)
  isValid(): boolean {
    const identityOk = !!this.idType && !!this.idNumber.trim() && !!this.idExpiresAt;
    const hasDiploma = this.diplomas.length > 0;
    return identityOk && hasDiploma;
  }
  markInvalid() { this.showErrors = true; }

  /** Appelé par le parent APRÈS création de l’employé */
  collectDrafts(): DraftDoc[] {
    // Identité (toujours incluse car OBLIGATOIRE)
    const drafts: DraftDoc[] = [{
      category: 'IDENTITE',
      type: this.idType,
      number: this.idNumber || undefined,
      expiryDate: this.idExpiresAt || undefined,
      file: this.idFile || null,
    }];

    drafts.push(...this.diplomas);
    return drafts;
  }
}
