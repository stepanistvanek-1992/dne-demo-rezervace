"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { supabase } from "@/lib/supabase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Plus, Trash2, CheckCircle, Lock, LogOut, RefreshCw, Edit2, X, Save, Upload, Loader2, FileText } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [reservations, setReservations] = useState<any[]>([]);
  const [bikes, setBikes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Bike Edit/Add state
  const [isBikeDialogOpen, setIsBikeDialogOpen] = useState(false);
  const [editingBike, setEditingBike] = useState<any>(null);
  const [bikeForm, setBikeForm] = useState({
    brand: "",
    model: "",
    type: "Naked",
    license_category: "A",
    engine: "",
    power: "",
    deposit: 10000,
    rental_fee: 500,
    image_url: "",
    description: ""
  });

  // Simple password check
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // We check locally first for UX, but real security is in the RPC call
    if (password === "DeusExMachina_1992") {
      setIsAuthenticated(true);
      sessionStorage.setItem("admin_auth", "true");
      sessionStorage.setItem("admin_pwd", password); // Store for RPC calls
      fetchData(password);
    } else {
      toast.error("Nesprávné heslo!");
    }
  };

  useEffect(() => {
    const auth = sessionStorage.getItem("admin_auth");
    const pwd = sessionStorage.getItem("admin_pwd");
    if (auth === "true" && pwd) {
      setIsAuthenticated(true);
      setPassword(pwd);
      fetchData(pwd);
    }
  }, []);

  async function fetchData(pwd: string = password) {
    if (!pwd) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_admin_data', { admin_password: pwd });
      
      if (error) throw error;

      if (data) {
        setReservations(data.reservations || []);
        setBikes(data.bikes || []);
      }
    } catch (error: any) {
      toast.error("Chyba při načítání dat: " + error.message);
      if (error.message.includes('Access Denied')) {
        setIsAuthenticated(false);
        sessionStorage.clear();
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function updateStatus(id: string, status: string) {
    try {
      const { error } = await supabase.rpc('confirm_reservation_secure', { 
        res_id: id, 
        admin_password: password 
      });
      if (error) throw error;
      toast.success("Rezervace potvrzena.");
      fetchData();
    } catch (error: any) {
      toast.error("Chyba při aktualizaci: " + error.message);
    }
  }

  async function deleteReservation(id: string) {
    if (!confirm("Opravdu chcete smazat tuto rezervaci?")) return;
    try {
      const { error } = await supabase.rpc('delete_reservation_secure', { 
        res_id: id, 
        admin_password: password 
      });
      if (error) throw error;
      toast.success("Smazáno.");
      fetchData();
    } catch (error: any) {
      toast.error("Chyba při mazání: " + error.message);
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('bikes')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('bikes')
        .getPublicUrl(filePath);

      setBikeForm({ ...bikeForm, image_url: publicUrl });
      toast.success("Obrázek nahrán.");
    } catch (error: any) {
      toast.error("Chyba při nahrávání: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Bike Management
  const openAddBike = () => {
    setEditingBike(null);
    setBikeForm({
      brand: "",
      model: "",
      type: "Naked",
      license_category: "A",
      engine: "",
      power: "",
      deposit: 10000,
      rental_fee: 500,
      image_url: "",
      description: ""
    });
    setIsBikeDialogOpen(true);
  };

  const openEditBike = (bike: any) => {
    setEditingBike(bike);
    setBikeForm({
      brand: bike.brand,
      model: bike.model,
      type: bike.type,
      license_category: bike.license_category,
      engine: bike.engine,
      power: bike.power,
      deposit: bike.deposit,
      rental_fee: bike.rental_fee,
      image_url: bike.image_url || "",
      description: bike.description || ""
    });
    setIsBikeDialogOpen(true);
  };

  const saveBike = async () => {
    setIsLoading(true);
    try {
      if (editingBike) {
        const { error } = await supabase
          .from("bikes")
          .update(bikeForm)
          .eq("id", editingBike.id);
        if (error) throw error;
        toast.success("Stroj byl upraven.");
      } else {
        const { error } = await supabase
          .from("bikes")
          .insert([bikeForm]);
        if (error) throw error;
        toast.success("Stroj byl přidán.");
      }
      setIsBikeDialogOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Chyba při ukládání stroje.");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteBike = async (id: string) => {
    if (!confirm("Opravdu chcete smazat tento stroj? Smažou se i všechny jeho rezervace!")) return;
    const { error } = await supabase.from("bikes").delete().eq("id", id);
    if (error) toast.error("Chyba při mazání stroje.");
    else { toast.success("Stroj smazán."); fetchData(); }
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-2xl">
          <div className="flex justify-center mb-8">
            <div className="bg-primary/10 p-5 rounded-3xl">
              <Lock className="w-10 h-10 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-black text-center mb-2 tracking-tighter">ADMIN VSTUP</h1>
          <p className="text-gray-400 text-center text-sm font-bold mb-8 uppercase tracking-widest">Zabezpečená sekce</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="password"
              placeholder="Zadejte heslo"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-2xl border-gray-100 bg-gray-50/50 h-14 font-bold text-center text-lg focus-visible:ring-primary focus-visible:border-primary transition-all"
            />
            <Button type="submit" className="w-full bg-primary hover:bg-black hover:text-white text-black font-black uppercase h-14 rounded-2xl transition-all duration-300 tracking-widest shadow-lg shadow-primary/20">
              Přihlásit se
            </Button>
          </form>
        </div>
        <Toaster position="top-center" richColors />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50/50">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">Administrace</h1>
            <p className="text-primary font-bold uppercase text-xs tracking-widest mt-2">Nina-X Rezervační systém</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => fetchData()} variant="outline" className="rounded-2xl font-bold uppercase text-xs px-6 h-11 bg-white border-gray-100 shadow-sm">
              <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} /> Obnovit
            </Button>
            <Button 
              onClick={() => { sessionStorage.clear(); setIsAuthenticated(false); }}
              variant="ghost" 
              className="rounded-2xl font-bold uppercase text-xs px-6 h-11 text-red-500 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" /> Odhlásit
            </Button>
          </div>
        </div>

        <Tabs defaultValue="reservations" className="w-full">
          <TabsList className="mb-10 bg-white p-1.5 rounded-3xl h-14 shadow-sm border border-gray-100 w-full max-w-md">
            <TabsTrigger value="reservations" className="rounded-[1.2rem] font-bold uppercase text-xs flex-1 data-[state=active]:bg-primary data-[state=active]:text-black transition-all">Rezervace</TabsTrigger>
            <TabsTrigger value="bikes" className="rounded-[1.2rem] font-bold uppercase text-xs flex-1 data-[state=active]:bg-primary data-[state=active]:text-black transition-all">Správa strojů</TabsTrigger>
          </TabsList>

          <TabsContent value="reservations">
            <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50 border-b border-gray-50">
                    <TableHead className="font-bold uppercase text-[10px] tracking-widest py-6 pl-8">Datum jízdy</TableHead>
                    <TableHead className="font-bold uppercase text-[10px] tracking-widest py-6">Motocykl</TableHead>
                    <TableHead className="font-bold uppercase text-[10px] tracking-widest py-6">Zákazník</TableHead>
                    <TableHead className="font-bold uppercase text-[10px] tracking-widest py-6">Kontakt</TableHead>
                    <TableHead className="font-bold uppercase text-[10px] tracking-widest py-6">Status</TableHead>
                    <TableHead className="text-right font-bold uppercase text-[10px] tracking-widest py-6 pr-8">Akce</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading && reservations.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-20 font-bold uppercase text-gray-300 animate-pulse">Načítám...</TableCell></TableRow>
                  ) : reservations.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-20 font-bold uppercase text-gray-300 italic">Žádné rezervace</TableCell></TableRow>
                  ) : (
                    reservations.map((res) => (
                      <TableRow key={res.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-50">
                        <TableCell className="font-black py-5 pl-8 text-lg tracking-tighter">{res.reservation_date}</TableCell>
                        <TableCell className="font-bold text-black">{res.bikes?.brand} {res.bikes?.model}</TableCell>
                        <TableCell className="font-medium">{res.full_name}</TableCell>
                        <TableCell>
                          <div className="text-xs font-bold text-gray-400">{res.email}</div>
                          <div className="text-xs font-black">{res.phone}</div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="secondary" 
                            className={cn(
                              "rounded-full font-black uppercase text-[9px] px-3 py-1 tracking-widest",
                              res.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-primary/20 text-black'
                            )}
                          >
                            {res.status === 'confirmed' ? 'Potvrzeno' : 'Nové'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right pr-8">
                          <div className="flex justify-end gap-2">
                            {res.status === 'pending' && (
                              <Button size="sm" variant="ghost" onClick={() => updateStatus(res.id, 'confirmed')} className="text-green-600 hover:bg-green-50 rounded-full h-9 w-9 p-0">
                                <CheckCircle className="h-5 w-5" />
                              </Button>
                            )}
                            <Button size="sm" variant="ghost" onClick={() => deleteReservation(res.id)} className="text-red-500 hover:bg-red-50 rounded-full h-9 w-9 p-0">
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="bikes">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black uppercase tracking-tighter">Seznam strojů</h2>
              <Button onClick={openAddBike} className="bg-primary text-black hover:bg-black hover:text-white font-bold uppercase h-12 rounded-2xl px-8 shadow-lg shadow-primary/20 transition-all duration-300">
                <Plus className="h-4 w-4 mr-2" /> Přidat nový
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {bikes.map((bike) => (
                <div key={bike.id} className="bg-white rounded-3xl p-6 flex flex-col group border border-gray-100 hover:shadow-xl transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-[10px] text-primary font-black uppercase tracking-widest">{bike.brand}</p>
                      <p className="text-xl font-black uppercase tracking-tighter my-1">{bike.model}</p>
                    </div>
                    <Badge variant="outline" className="rounded-full text-[10px] font-bold px-3">{bike.license_category}</Badge>
                  </div>
                  
                  <div className="space-y-1 mb-6 flex-1">
                    <p className="text-xs font-bold text-gray-400 uppercase">{bike.type}</p>
                    <p className="text-xs font-bold text-gray-500 uppercase">{bike.engine} | {bike.power}</p>
                    <p className="text-xs font-black text-black mt-2">{bike.rental_fee} Kč / den</p>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-gray-50">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => openEditBike(bike)}
                      className="flex-1 text-gray-600 hover:bg-gray-50 rounded-xl font-bold text-xs uppercase"
                    >
                      <Edit2 className="h-3 w-3 mr-2" /> Upravit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => deleteBike(bike.id)}
                      className="text-red-500 hover:bg-red-50 rounded-xl h-9 w-9 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Bike Dialog */}
      <Dialog open={isBikeDialogOpen} onOpenChange={setIsBikeDialogOpen}>
        <DialogContent className="sm:max-w-[700px] rounded-[2.5rem] p-10 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black tracking-tighter uppercase italic">
              {editingBike ? "Upravit stroj" : "Přidat nový stroj"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-6 py-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Značka</label>
              <Input 
                value={bikeForm.brand} 
                onChange={(e) => setBikeForm({...bikeForm, brand: e.target.value})}
                placeholder="Zontes" 
                className="rounded-2xl border-gray-100 bg-gray-50/50 h-12 font-bold" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Model</label>
              <Input 
                value={bikeForm.model} 
                onChange={(e) => setBikeForm({...bikeForm, model: e.target.value})}
                placeholder="350 GK" 
                className="rounded-2xl border-gray-100 bg-gray-50/50 h-12 font-bold" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Typ</label>
              <Select value={bikeForm.type} onValueChange={(val) => setBikeForm({...bikeForm, type: val})}>
                <SelectTrigger className="rounded-2xl border-gray-100 bg-gray-50/50 h-12 font-bold">
                  <SelectValue placeholder="Vyberte typ" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-2xl">
                  <SelectItem value="Scooter">Scooter</SelectItem>
                  <SelectItem value="Adventure">Adventure</SelectItem>
                  <SelectItem value="SuperSport">SuperSport</SelectItem>
                  <SelectItem value="Nakedbike">Nakedbike</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Řidičák</label>
              <Select value={bikeForm.license_category} onValueChange={(val) => setBikeForm({...bikeForm, license_category: val})}>
                <SelectTrigger className="rounded-2xl border-gray-100 bg-gray-50/50 h-12 font-bold">
                  <SelectValue placeholder="Vyberte skupinu" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-2xl">
                  <SelectItem value="A">Skupina A</SelectItem>
                  <SelectItem value="A1">Skupina A1</SelectItem>
                  <SelectItem value="A2">Skupina A2</SelectItem>
                  <SelectItem value="B">Skupina B</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Motor</label>
              <Input 
                value={bikeForm.engine} 
                onChange={(e) => setBikeForm({...bikeForm, engine: e.target.value})}
                placeholder="Jednoválec 350 ccm" 
                className="rounded-2xl border-gray-100 bg-gray-50/50 h-12 font-bold" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Výkon</label>
              <Input 
                value={bikeForm.power} 
                onChange={(e) => setBikeForm({...bikeForm, power: e.target.value})}
                placeholder="29 kW" 
                className="rounded-2xl border-gray-100 bg-gray-50/50 h-12 font-bold" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Kauce (Kč)</label>
              <Input 
                type="number"
                value={bikeForm.deposit} 
                onChange={(e) => setBikeForm({...bikeForm, deposit: parseInt(e.target.value)})}
                className="rounded-2xl border-gray-100 bg-gray-50/50 h-12 font-bold" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Půjčovné (Kč/den)</label>
              <Input 
                type="number"
                value={bikeForm.rental_fee} 
                onChange={(e) => setBikeForm({...bikeForm, rental_fee: parseInt(e.target.value)})}
                className="rounded-2xl border-gray-100 bg-gray-50/50 h-12 font-bold" 
              />
            </div>

            <div className="col-span-2 space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">O stroji / Technické specifikace</label>
              <Textarea 
                value={bikeForm.description} 
                onChange={(e) => setBikeForm({...bikeForm, description: e.target.value})}
                placeholder="Podrobný popis stroje, výbava, doplňky..." 
                className="rounded-2xl border-gray-100 bg-gray-50/50 min-h-[150px] font-medium p-4 focus-visible:ring-primary" 
              />
            </div>

            <div className="col-span-2 space-y-4">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Fotografie stroje</label>
              <div className="flex flex-col gap-4">
                <div className="flex gap-4 items-center">
                  <div className="flex-1 relative">
                    <Input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                      className="hidden"
                      id="image-upload"
                    />
                    <label 
                      htmlFor="image-upload"
                      className="flex items-center justify-center gap-2 w-full h-12 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-all font-bold text-xs uppercase"
                    >
                      {isUploading ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Nahrávám...</>
                      ) : (
                        <><Upload className="w-4 h-4" /> Vybrat fotku z počítače</>
                      )}
                    </label>
                  </div>
                  {bikeForm.image_url && (
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-gray-100">
                      <img src={bikeForm.image_url} className="w-full h-full object-cover" alt="Preview" />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <p className="text-[9px] font-bold text-gray-300 uppercase tracking-tighter">Nebo vložte přímý odkaz:</p>
                  <Input 
                    value={bikeForm.image_url} 
                    onChange={(e) => setBikeForm({...bikeForm, image_url: e.target.value})}
                    placeholder="https://example.com/bike.jpg" 
                    className="rounded-2xl border-gray-100 bg-gray-50/50 h-10 text-xs" 
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-8 flex gap-4">
            <Button variant="ghost" onClick={() => setIsBikeDialogOpen(false)} className="rounded-2xl font-bold uppercase text-xs h-12 px-6">
              Zrušit
            </Button>
            <Button 
              onClick={saveBike} 
              disabled={isUploading}
              className="bg-primary text-black hover:bg-black hover:text-white font-black uppercase tracking-widest h-12 rounded-2xl px-10 shadow-lg shadow-primary/20 flex-1"
            >
              <Save className="h-4 w-4 mr-2" /> {editingBike ? "Uložit změny" : "Přidat stroj"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster position="top-center" richColors />
    </main>
  );
}
