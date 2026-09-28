import { CircleAlert, CircleCheck } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const errors: Record<string, string> = {
  credenciales: "Ese mail o esa contraseña no coinciden.",
  estado: "Tu ficha todavía no está activa. La comisión tiene que aprobarla.",
  registro: "Revisá el nombre, el mail y que la contraseña tenga al menos 8 caracteres.",
  existe: "Ese mail ya está en el padrón.",
  idea: "La idea necesita un título y un texto.",
  nombre: "Falta el nombre.",
  item: "El ítem necesita una descripción.",
  permiso: "Eso lo hace la comisión.",
  post: "El aviso necesita título y texto.",
  evento: "El evento necesita título y fecha.",
  guardar: "No se pudo guardar. Probá de nuevo en un momento.",
};

const oks: Record<string, string> = {
  pendiente:
    "Quedó tu pedido de alta. Cuando la comisión lo pase a activo, vas a poder entrar.",
  listo: "La presidencia ya está creada. Entrá con ese mail.",
};

export function Notice({
  error,
  ok,
}: {
  error?: string;
  ok?: string;
}) {
  if (error && errors[error]) {
    return (
      <Alert variant="destructive">
        <CircleAlert />
        <AlertDescription>{errors[error]}</AlertDescription>
      </Alert>
    );
  }
  if (ok && oks[ok]) {
    return (
      <Alert className="border-accent bg-accent/40 text-foreground">
        <CircleCheck className="text-primary" />
        <AlertDescription className="text-foreground">{oks[ok]}</AlertDescription>
      </Alert>
    );
  }
  return null;
}
