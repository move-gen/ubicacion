import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
export default function CardPrincipal({ user }) {
  return (
    <Card
      className="bg-gradient-to-r from-colorPrincipal to-colorClaro shadow-lg rounded-lg xl:col-span-2"
      x-chunk="dashboard-01-chunk-1"
    >
      <CardHeader className="text-left">
        <CardTitle className="text-lg font-thin text-white">
          Bienvenido de vuelta 👋🏼
        </CardTitle>
        <h2 className="text-2xl font-bold text-white mt-2">
          {user?.given_name + " " + user?.family_name}
        </h2>
      </CardHeader>
      <CardContent className="text-left">
        <p className="text-white font-thin">
          Administra desde este panel de control la ubicación de los vehículos
        </p>
      </CardContent>
      <CardFooter className="justify-left"></CardFooter>
    </Card>
  );
}
