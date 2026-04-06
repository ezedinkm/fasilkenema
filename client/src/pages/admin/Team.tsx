import AdminLayout from "@/components/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import FootballMenTeam from "./team/FootballMenTeam";
import FootballWomenTeam from "./team/FootballWomenTeam";
import FootballJuniorTeam from "./team/FootballJuniorTeam";
import BasketballTeam from "./team/BasketballTeam";
import HandballTeam from "./team/HandballTeam";
import BoxTeam from "./team/BoxTeam";

export default function AdminTeam() {
  return (
    <AdminLayout>
      <div className="space-y-8 min-w-0">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-zinc-900">
            Team Management
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Create, edit, and manage players across all sports teams.
          </p>
        </div>

        <Tabs defaultValue="football-men" className="w-full min-w-0">
          <TabsList className="mb-4 flex h-auto w-full max-w-full flex-nowrap justify-start gap-1 overflow-x-auto p-1 sm:flex-wrap sm:overflow-visible">
            <TabsTrigger value="football-men">Football Men</TabsTrigger>
            <TabsTrigger value="football-women">Football Women</TabsTrigger>
            <TabsTrigger value="football-junior">Football Junior</TabsTrigger>
            <TabsTrigger value="basketball">Basketball</TabsTrigger>
            <TabsTrigger value="handball">Handball</TabsTrigger>
            <TabsTrigger value="box">Box</TabsTrigger>
          </TabsList>

          <TabsContent value="football-men">
            <Card>
              <CardHeader>
                <CardTitle>Football Men</CardTitle>
                <CardDescription>
                  Manage the men's football squad roster.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FootballMenTeam />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="football-women">
            <Card>
              <CardHeader>
                <CardTitle>Football Women</CardTitle>
                <CardDescription>
                  Manage the women's football squad roster.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FootballWomenTeam />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="football-junior">
            <Card>
              <CardHeader>
                <CardTitle>Football Junior</CardTitle>
                <CardDescription>
                  Manage the junior football squad roster.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FootballJuniorTeam />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="basketball">
            <Card>
              <CardHeader>
                <CardTitle>Basketball</CardTitle>
                <CardDescription>
                  Manage the basketball team roster.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BasketballTeam />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="handball">
            <Card>
              <CardHeader>
                <CardTitle>Handball</CardTitle>
                <CardDescription>
                  Manage the handball team roster.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <HandballTeam />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="box">
            <Card>
              <CardHeader>
                <CardTitle>Box</CardTitle>
                <CardDescription>
                  Manage the boxing team roster.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BoxTeam />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
