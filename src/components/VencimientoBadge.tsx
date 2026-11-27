import { diasParaVencer, estadoVencimiento } from '../utils/vencimientos';

interface Props {
    fecha: string;
}

export const VencimientoBadge = ({ fecha }: Props) => {
    if (!fecha) {
        return <span>-</span>;
    }

    const estado = estadoVencimiento(fecha);
    const dias = diasParaVencer(fecha);
    const texto = fecha.slice(0, 10);

    if (estado === 'vencido') {
        return (
            <span className="badge badge-danger" title={`Venció hace ${Math.abs(dias)} días`}>
                {texto} · Vencido
            </span>
        );
    }

    if (estado === 'por_vencer') {
        return (
            <span className="badge badge-warning" title={`Vence en ${dias} días`}>
                {texto} · {dias} d
            </span>
        );
    }

    return <span>{texto}</span>;
};