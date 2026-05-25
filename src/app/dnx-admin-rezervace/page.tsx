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
import { Plus, Trash2, CheckCircle, Lock, LogOut, RefreshCw, Edit2, Save, Upload, Loader2, Eye, EyeOff } from "lucide-react";
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
    type: "Nakedbike",
    license_category: "A",
    engine: "",
    power: "",
    deposit: 20000,
    rental_fee: 0,
    image_url: "",
    description: "",
    isVisible: true
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin", {
        headers: {
          "x-admin-password": password
        }
      });
      if (response.ok) {
        setIsAuthenticated(true);
        sessionStorage.setItem("admin_auth", "true");
        sessionStorage.setItem("admin_pwd", password);
        const data = await response.json();
        setReservations(data.reservations || []);
        setBikes(data.bikes || []);
        toast.success("Přihlášení úspěšné.");
      } else {
        toast.error("Nesprávné heslo!");
      }
    } catch (err: any) {
      toast.error("Chyba přihlašování: " + err.message);
    } finally {
      setIsLoading(false);
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
      const response = await fetch("/api/admin", {
        headers: {
          "x-admin-password": pwd
        }
      });
      if (response.status === 401) {
        setIsAuthenticated(false);
        sessionStorage.clear();
        throw new Error("Neautorizovaný přístup - nesprávné heslo.");
      }
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Nepodařilo se načíst data.");
      }
      const data = await response.json();
      setReservations(data.reservations || []);
      setBikes(data.bikes || []);
    } catch (error: any) {
      toast.error("Chyba při načítání: " + error.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function updateStatus(id: string) {
    try {
      const response = await fetch("/api/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password
        },
        body: JSON.stringify({ action: 'confirm_reservation', id })
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Chyba při potvrzení rezervace.");
      }
      toast.success("Rezervace potvrzena.");
      fetchData();
    } catch (error: any) {
      toast.error("Chyba: " + error.message);
    }
  }

  async function deleteReservation(id: string) {
    if (!confirm("Opravdu chcete smazat tuto rezervaci?")) return;
    try {
      const response = await fetch("/api/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password
        },
        body: JSON.stringify({ action: 'delete_reservation', id })
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Chyba při mazání rezervace.");
      }
      toast.success("Smazáno.");
      fetchData();
    } catch (error: any) {
      toast.error("Chyba: " + error.message);
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const fileName = `${Math.random().toString(36).substring(2)}.${file.name.split('.').pop()}`;
      const { error: uploadError } = await supabase.storage.from('bikes').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('bikes').getPublicUrl(fileName);
      setBikeForm({ ...bikeForm, image_url: publicUrl });
      toast.success("Obrázek nahrán.");
    } catch (error: any) {
      toast.error("Chyba nahrávání: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const openAddBike = () => {
    setEditingBike(null);
    setBikeForm({
      brand: "", model: "", type: "Nakedbike", license_category: "A",
      engine: "", power: "", deposit: 20000, rental_fee: 0, image_url: "", description: "",
      isVisible: true
    });
    setIsBikeDialogOpen(true);
  };

  const openEditBike = (bike: any) => {
    setEditingBike(bike);
    const isHidden = (bike.description || "").includes('[SKRYTO]');
    const cleanedDesc = (bike.description || "").replace(/\s*\[SKRYTO\]/g, "").trim();
    setBikeForm({
      brand: bike.brand, model: bike.model, type: bike.type,
      license_category: bike.license_category, engine: bike.engine, power: bike.power,
      deposit: bike.deposit, rental_fee: bike.rental_fee, image_url: bike.image_url || "",
      description: cleanedDesc,
      isVisible: !isHidden
    });
    setIsBikeDialogOpen(true);
  };

  const saveBike = async () => {
    setIsLoading(true);
    const cleanDesc = bikeForm.description.replace(/\s*\[SKRYTO\]/g, "").trim();
    const finalDesc = bikeForm.isVisible ? cleanDesc : `${cleanDesc} [SKRYTO]`;
    try {
      const response = await fetch("/api/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password
        },
        body: JSON.stringify({
          action: 'save_bike',
          p_id: editingBike?.id || null,
          p_brand: bikeForm.brand,
          p_model: bikeForm.model,
          p_type: bikeForm.type,
          p_license_category: bikeForm.license_category,
          p_engine: bikeForm.engine,
          p_power: bikeForm.power,
          p_deposit: bikeForm.deposit,
          p_rental_fee: bikeForm.rental_fee,
          p_image_url: bikeForm.image_url,
          p_description: finalDesc
        })
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Chyba při ukládání stroje.");
      }
      toast.success(editingBike ? "Stroj upraven." : "Stroj přidán.");
      setIsBikeDialogOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error("Chyba při ukládání: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVisibility = async (bike: any) => {
    setIsLoading(true);
    const isHidden = (bike.description || "").includes('[SKRYTO]');
    const cleanDesc = (bike.description || "").replace(/\s*\[SKRYTO\]/g, "").trim();
    const finalDesc = isHidden ? cleanDesc : `${cleanDesc} [SKRYTO]`;
    
    try {
      const response = await fetch("/api/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password
        },
        body: JSON.stringify({
          action: 'save_bike',
          p_id: bike.id,
          p_brand: bike.brand,
          p_model: bike.model,
          p_type: bike.type,
          p_license_category: bike.license_category,
          p_engine: bike.engine,
          p_power: bike.power,
          p_deposit: bike.deposit,
          p_rental_fee: bike.rental_fee,
          p_image_url: bike.image_url || "",
          p_description: finalDesc
        })
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Chyba při změně viditelnosti.");
      }
      toast.success(isHidden ? "Stroj je nyní viditelný." : "Stroj byl skryt.");
      fetchData();
    } catch (error: any) {
      toast.error("Chyba při změně viditelnosti: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteBike = async (id: string) => {
    if (!confirm("Opravdu smazat stroj?")) return;
    try {
      const response = await fetch("/api/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password
        },
        body: JSON.stringify({ action: 'delete_bike', id })
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Chyba při mazání stroje.");
      }
      toast.success("Stroj smazán.");
      fetchData();
    } catch (error: any) {
      toast.error("Chyba při mazání: " + error.message);
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-2xl">
          <div className="flex justify-center mb-8"><div className="bg-primary/10 p-5 rounded-3xl"><Lock className="w-10 h-10 text-primary" /></div></div>
          <h1 className="text-3xl font-black text-center mb-2 tracking-tighter">ADMIN VSTUP</h1>
          <p className="text-gray-400 text-center text-sm font-bold mb-8 uppercase tracking-widest">Zabezpečená sekce</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input type="password" placeholder="Heslo" value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-2xl border-gray-100 h-14 font-bold text-center text-lg" />
            <Button type="submit" className="w-full bg-primary text-black font-black uppercase h-14 rounded-2xl shadow-lg shadow-primary/20">Přihlásit se</Button>
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
            <p className="text-primary font-bold uppercase text-xs tracking-widest mt-2">Motoshop DNX System</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => fetchData()} variant="outline" className="rounded-2xl font-bold uppercase text-xs h-11 bg-white"><RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} /> Obnovit</Button>
            <Button onClick={() => { sessionStorage.clear(); setIsAuthenticated(false); }} variant="ghost" className="rounded-2xl font-bold uppercase text-xs h-11 text-red-500"><LogOut className="w-4 h-4 mr-2" /> Odhlásit</Button>
          </div>
        </div>

        <Tabs defaultValue="reservations" className="w-full">
          <TabsList className="mb-10 bg-white p-1.5 rounded-3xl h-14 shadow-sm border border-gray-100 w-full max-w-md">
            <TabsTrigger value="reservations" className="rounded-[1.2rem] font-bold uppercase text-xs flex-1 data-[state=active]:bg-primary">Rezervace</TabsTrigger>
            <TabsTrigger value="bikes" className="rounded-[1.2rem] font-bold uppercase text-xs flex-1 data-[state=active]:bg-primary">Stroje</TabsTrigger>
          </TabsList>

          <TabsContent value="reservations">
            <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50">
                    <TableHead className="font-bold uppercase text-[10px] py-6 pl-8">Datum</TableHead>
                    <TableHead className="font-bold uppercase text-[10px]">Stroj</TableHead>
                    <TableHead className="font-bold uppercase text-[10px]">Zákazník</TableHead>
                    <TableHead className="font-bold uppercase text-[10px]">Kontakt</TableHead>
                    <TableHead className="font-bold uppercase text-[10px]">Status</TableHead>
                    <TableHead className="text-right font-bold uppercase text-[10px] pr-8">Akce</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reservations.map((res) => (
                    <TableRow key={res.id} className="border-b border-gray-50">
                      <TableCell className="font-black py-5 pl-8 text-lg tracking-tighter">{res.reservation_date}</TableCell>
                      <TableCell className="font-bold">{res.bikes?.brand} {res.bikes?.model}</TableCell>
                      <TableCell className="font-medium">{res.full_name}</TableCell>
                      <TableCell><div className="text-xs font-bold text-gray-400">{res.email}</div><div className="text-xs font-black">{res.phone}</div></TableCell>
                      <TableCell><Badge className={cn("rounded-full font-black uppercase text-[9px] px-3 py-1", res.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-primary/20 text-black')}>{res.status === 'confirmed' ? 'Potvrzeno' : 'Nové'}</Badge></TableCell>
                      <TableCell className="text-right pr-8">
                        <div className="flex justify-end gap-2">
                          {res.status === 'pending' && <Button size="sm" variant="ghost" onClick={() => updateStatus(res.id)} className="text-green-600 rounded-full h-9 w-9 p-0"><CheckCircle className="h-5 w-5" /></Button>}
                          <Button size="sm" variant="ghost" onClick={() => deleteReservation(res.id)} className="text-red-500 rounded-full h-9 w-9 p-0"><Trash2 className="h-5 w-5" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="bikes">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black uppercase tracking-tighter">Seznam strojů</h2>
              <Button onClick={openAddBike} className="bg-primary text-black font-bold h-12 rounded-2xl px-8 shadow-lg shadow-primary/20"><Plus className="h-4 w-4 mr-2" /> Přidat nový</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {bikes.map((bike) => {
                const isHidden = (bike.description || "").includes('[SKRYTO]');
                return (
                  <div key={bike.id} className="bg-white rounded-3xl p-6 flex flex-col border border-gray-100 hover:shadow-xl transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-[10px] text-primary font-black uppercase tracking-widest">{bike.brand}</p>
                        <p className="text-xl font-black uppercase tracking-tighter my-1">{bike.model}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <Badge variant="outline" className="rounded-full text-[10px] font-bold px-3">{bike.license_category}</Badge>
                        <Badge variant="secondary" className={cn("rounded-full font-black uppercase text-[9px] px-2 py-0.5 border-none", isHidden ? 'bg-red-100 text-red-700 hover:bg-red-100' : 'bg-green-100 text-green-700 hover:bg-green-100')}>
                          {isHidden ? 'Skrytý' : 'Aktivní'}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-1 mb-6 flex-1 text-xs font-bold text-gray-500 uppercase">
                      <p>{bike.type}</p><p>{bike.engine} | {bike.power}</p>
                    </div>
                    <div className="flex gap-2 pt-4 border-t border-gray-50">
                      <Button size="sm" variant="ghost" onClick={() => openEditBike(bike)} className="flex-1 text-gray-600 font-bold text-xs uppercase"><Edit2 className="h-3 w-3 mr-2" /> Upravit</Button>
                      <Button size="sm" variant="ghost" onClick={() => toggleVisibility(bike)} className="text-gray-600 h-9 w-9 p-0 hover:text-black hover:bg-gray-100 rounded-full" title={isHidden ? "Zobrazit na webu" : "Skrýt z webu"}>
                        {isHidden ? <Eye className="h-4 w-4 text-green-600" /> : <EyeOff className="h-4 w-4 text-red-500" />}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteBike(bike.id)} className="text-red-500 h-9 w-9 p-0"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isBikeDialogOpen} onOpenChange={setIsBikeDialogOpen}>
        <DialogContent className="sm:max-w-[700px] rounded-[2.5rem] p-10 max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-3xl font-black tracking-tighter uppercase italic">{editingBike ? "Upravit stroj" : "Přidat stroj"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-6 py-4">
            <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Značka</label><Input value={bikeForm.brand} onChange={(e) => setBikeForm({...bikeForm, brand: e.target.value})} className="rounded-2xl h-12 font-bold" /></div>
            <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Model</label><Input value={bikeForm.model} onChange={(e) => setBikeForm({...bikeForm, model: e.target.value})} className="rounded-2xl h-12 font-bold" /></div>
            <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Typ</label><Select value={bikeForm.type} onValueChange={(val) => setBikeForm({...bikeForm, type: val})}><SelectTrigger className="rounded-2xl h-12 font-bold"><SelectValue /></SelectTrigger><SelectContent className="rounded-2xl border-none shadow-2xl"><SelectItem value="Scooter">Scooter</SelectItem><SelectItem value="Adventure">Adventure</SelectItem><SelectItem value="SuperSport">Supersport</SelectItem><SelectItem value="Nakedbike">Nakedbike</SelectItem><SelectItem value="Heritage">Heritage</SelectItem></SelectContent></Select></div>
            <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Řidičák</label><Select value={bikeForm.license_category} onValueChange={(val) => setBikeForm({...bikeForm, license_category: val})}><SelectTrigger className="rounded-2xl h-12 font-bold"><SelectValue /></SelectTrigger><SelectContent className="rounded-2xl border-none shadow-2xl"><SelectItem value="A">A</SelectItem><SelectItem value="A2">A2</SelectItem><SelectItem value="A1">A1</SelectItem><SelectItem value="B">B</SelectItem></SelectContent></Select></div>
            <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Motor</label><Input value={bikeForm.engine} onChange={(e) => setBikeForm({...bikeForm, engine: e.target.value})} className="rounded-2xl h-12 font-bold" /></div>
            <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Výkon</label><Input value={bikeForm.power} onChange={(e) => setBikeForm({...bikeForm, power: e.target.value})} className="rounded-2xl h-12 font-bold" /></div>
            <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Kauce</label><Input type="number" value={bikeForm.deposit} onChange={(e) => setBikeForm({...bikeForm, deposit: parseInt(e.target.value)})} className="rounded-2xl h-12 font-bold" /></div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Viditelnost na webu</label>
              <Select value={bikeForm.isVisible ? "true" : "false"} onValueChange={(val) => setBikeForm({...bikeForm, isVisible: val === "true"})}>
                <SelectTrigger className="rounded-2xl h-12 font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-2xl">
                  <SelectItem value="true">Zobrazit na webu</SelectItem>
                  <SelectItem value="false">Skrýt z webu</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase ml-1">O stroji</label><Textarea value={bikeForm.description} onChange={(e) => setBikeForm({...bikeForm, description: e.target.value})} className="rounded-2xl min-h-[120px]" /></div>
            <div className="col-span-2 space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Fotka</label>
              <div className="flex gap-4 items-center">
                <Input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="img-up" />
                <label htmlFor="img-up" className="flex-1 flex items-center justify-center h-12 border-2 border-dashed rounded-2xl cursor-pointer font-bold text-xs uppercase hover:bg-gray-50">{isUploading ? "Nahrávám..." : "Nahrát fotku"}</label>
                {bikeForm.image_url && <img src={bikeForm.image_url} className="w-12 h-12 rounded-xl object-cover" alt="Pre" />}
              </div>
            </div>
          </div>
          <DialogFooter className="mt-8 gap-4"><Button variant="ghost" onClick={() => setIsBikeDialogOpen(false)} className="rounded-2xl font-bold uppercase text-xs h-12">Zrušit</Button><Button onClick={saveBike} className="bg-primary text-black font-black uppercase h-12 rounded-2xl px-10 flex-1"><Save className="h-4 w-4 mr-2" /> Uložit</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <Toaster position="top-center" richColors />
    </main>
  );
}
