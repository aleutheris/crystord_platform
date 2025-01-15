export interface BelastingElement {
  kwartaal: string,
  begindatum: string,
  einddatum: string,
  omzet: string,
  ontvangen: string,
  voorbelasting: string,
};

export interface PreBelastingElement {
  datum: string,
  omzet: string,
  ontvangen: string,
  voorbelasting: string,
};
