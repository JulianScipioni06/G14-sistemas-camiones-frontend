export type EstadoVencimiento = 'vencido' | 'por_vencer' | 'vigente';

export const DIAS_AVISO = 30;

// Parsea "YYYY-MM-DD" como fecha local (evita el corrimiento por zona horaria)
export const diasParaVencer = (fecha: string): number => {
    const [anio, mes, dia] = fecha.slice(0, 10).split('-').map(Number);
    const vencimiento = new Date(anio, mes - 1, dia);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return Math.round((vencimiento.getTime() - hoy.getTime()) / 86400000);
};

export const estadoVencimiento = (fecha: string): EstadoVencimiento => {
    const dias = diasParaVencer(fecha);
    if (dias < 0) {
        return 'vencido';
    }
    if (dias <= DIAS_AVISO) {
        return 'por_vencer';
    }
    return 'vigente';
};