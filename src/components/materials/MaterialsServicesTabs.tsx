
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Settings } from "lucide-react";
import MaterialsTab from "@/components/materials/MaterialsTab";
import ServicesTab from "@/components/services/ServicesTab";

const MaterialsServicesTabs = () => {
  const [activeTab, setActiveTab] = useState("materials");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="materials" className="flex items-center gap-2">
          <Package size={20} />
          Materiais
        </TabsTrigger>
        <TabsTrigger value="services" className="flex items-center gap-2">
          <Settings size={20} />
          Serviços
        </TabsTrigger>
      </TabsList>

      <TabsContent value="materials" className="space-y-6 mt-6">
        <MaterialsTab />
      </TabsContent>

      <TabsContent value="services" className="space-y-6 mt-6">
        <ServicesTab />
      </TabsContent>
    </Tabs>
  );
};

export default MaterialsServicesTabs;
