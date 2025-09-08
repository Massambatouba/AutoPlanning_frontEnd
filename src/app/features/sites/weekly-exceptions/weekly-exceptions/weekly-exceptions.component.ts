import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule, FormArray } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SiteWeeklyExceptionService } from 'src/app/services/site-weekly-exception.service';
import { SiteWeeklyException, WeeklyExceptionType, SiteWeeklyExceptionRequest } from 'src/app/shared/models/site-weekly-exception.model';
import { DayOfWeek } from 'src/app/shared/models/day-of-week.model';
import { AgentType } from 'src/app/shared/models/agent-type.model';

@Component({
  standalone: true,
  selector: 'app-weekly-exceptions',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './weekly-exceptions.component.html',
  styleUrls: ['./weekly-exceptions.component.scss']
})
export class WeeklyExceptionsComponent implements OnInit {
  siteId!: number;
  items: SiteWeeklyException[] = [];
  loading = true;
  error = '';

  // UI
  editing?: SiteWeeklyException; // si défini => mode édition
  form!: FormGroup;

  types: {value: WeeklyExceptionType, label: string}[] = [
    { value: 'CLOSE_DAY',  label: 'Fermeture (aucune vacation)' },
    { value: 'ADD_SHIFT',  label: 'Ajouter une vacation' },
    { value: 'MASK_SHIFT', label: 'Masquer une vacation' },
    { value: 'REPLACE_DAY',label: 'Remplacer toute la journée' },
  ];

  days = [
    {value: DayOfWeek.MONDAY,    label:'Lun'},
    {value: DayOfWeek.TUESDAY,   label:'Mar'},
    {value: DayOfWeek.WEDNESDAY, label:'Mer'},
    {value: DayOfWeek.THURSDAY,  label:'Jeu'},
    {value: DayOfWeek.FRIDAY,    label:'Ven'},
    {value: DayOfWeek.SATURDAY,  label:'Sam'},
    {value: DayOfWeek.SUNDAY,    label:'Dim'},
  ];

  agentTypes = Object.values(AgentType);

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private api: SiteWeeklyExceptionService
  ) {}

  ngOnInit(): void {
    this.siteId = Number(this.route.snapshot.paramMap.get('siteId'));
    this.buildForm();
    this.reload();
  }

  private buildForm() {
    this.form = this.fb.group({
      type:        ['CLOSE_DAY', Validators.required],
      startDate:   ['', Validators.required],
      endDate:     ['', Validators.required],
      daysOfWeek:  [[]], // DayOfWeek[]
      agentType:   [null],
      startTime:   [null],
      endTime:     [null],
      requiredCount: [1],
      minExperience: [0],
      requiredSkillsCsv: [''] // champ texte, CSV
    });

    // validations conditionnelles
    this.form.get('type')!.valueChanges.subscribe(t => this.applyConditionalValidators(t));
    this.applyConditionalValidators(this.form.value.type);
  }

  private applyConditionalValidators(type: WeeklyExceptionType) {
    const agentType   = this.form.get('agentType')!;
    const startTime   = this.form.get('startTime')!;
    const endTime     = this.form.get('endTime')!;
    const requiredCnt = this.form.get('requiredCount')!;

    // reset validators
    agentType.clearValidators();
    startTime.clearValidators();
    endTime.clearValidators();
    requiredCnt.clearValidators();

    if (type === 'ADD_SHIFT' || type === 'REPLACE_DAY') {
      agentType.setValidators([Validators.required]);
      startTime.setValidators([Validators.required]);
      endTime.setValidators([Validators.required]);
      requiredCnt.setValidators([Validators.required, Validators.min(1)]);
    } else if (type === 'MASK_SHIFT') {
      // tout optionnel (permet de masquer tout un jour, ou un créneau, ou un type précis)
      // si tu veux forcer au moins une contrainte, ajoute une validation custom
    } // CLOSE_DAY : aucune contrainte de shift

    agentType.updateValueAndValidity();
    startTime.updateValueAndValidity();
    endTime.updateValueAndValidity();
    requiredCnt.updateValueAndValidity();
  }

  private reload() {
    this.loading = true;
    this.api.list(this.siteId).subscribe({
      next: (rows) => { this.items = rows; this.loading = false; },
      error: (err) => { this.error = err.message || 'Erreur de chargement'; this.loading = false; }
    });
  }

  // helpers UI
  toggleDay(d: DayOfWeek) {
    const arr: DayOfWeek[] = [...this.form.value.daysOfWeek];
    const i = arr.indexOf(d);
    if (i > -1) arr.splice(i,1); else arr.push(d);
    this.form.get('daysOfWeek')!.setValue(arr);
  }

  edit(row: SiteWeeklyException) {
    this.editing = row;
    this.form.reset({
      type: row.type,
      startDate: row.startDate,
      endDate: row.endDate,
      daysOfWeek: row.daysOfWeek ?? [],
      agentType: row.agentType ?? null,
      startTime: row.startTime ?? null,
      endTime: row.endTime ?? null,
      requiredCount: row.requiredCount ?? 1,
      minExperience: row.minExperience ?? 0,
      requiredSkillsCsv: (row.requiredSkills ?? []).join(', ')
    });
    this.applyConditionalValidators(row.type);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit() {
    this.editing = undefined;
    this.form.reset({
      type: 'CLOSE_DAY',
      startDate: '',
      endDate: '',
      daysOfWeek: [],
      agentType: null,
      startTime: null,
      endTime: null,
      requiredCount: 1,
      minExperience: 0,
      requiredSkillsCsv: ''
    });
    this.applyConditionalValidators('CLOSE_DAY');
  }

  save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    const v = this.form.value;
    const body: SiteWeeklyExceptionRequest = {
      type: v.type,
      startDate: v.startDate,
      endDate:   v.endDate,
      daysOfWeek: v.daysOfWeek?.length ? v.daysOfWeek : undefined,
      agentType: (v.type === 'ADD_SHIFT' || v.type === 'REPLACE_DAY' || v.type === 'MASK_SHIFT') ? v.agentType : undefined,
      startTime: (v.type === 'ADD_SHIFT' || v.type === 'REPLACE_DAY' || v.type === 'MASK_SHIFT') ? v.startTime || undefined : undefined,
      endTime:   (v.type === 'ADD_SHIFT' || v.type === 'REPLACE_DAY' || v.type === 'MASK_SHIFT') ? v.endTime   || undefined : undefined,
      requiredCount: (v.type === 'ADD_SHIFT' || v.type === 'REPLACE_DAY') ? (v.requiredCount ?? 1) : undefined,
      minExperience: v.minExperience ?? 0,
      requiredSkills: v.requiredSkillsCsv
        ? String(v.requiredSkillsCsv).split(',').map((s:string)=>s.trim()).filter(Boolean)
        : undefined
    };

    const obs = this.editing
      ? this.api.update(this.siteId, this.editing.id, body)
      : this.api.create(this.siteId, body);

    obs.subscribe({
      next: () => { this.cancelEdit(); this.reload(); },
      error: (err) => { this.error = err.error?.message || err.message || 'Échec de sauvegarde'; }
    });
  }

  remove(row: SiteWeeklyException) {
    if (!confirm('Supprimer cette exception ?')) return;
    this.api.delete(this.siteId, row.id).subscribe({
      next: () => this.reload(),
      error: (err) => this.error = err.message || 'Échec suppression'
    });
  }

  // jolis labels
  typeLabel(t: WeeklyExceptionType) {
    return this.types.find(x => x.value === t)?.label ?? t;
  }
}
