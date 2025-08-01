
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Plus, Utensils, Apple } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useUser } from '@/context/UserContext';
import { supabase } from '@/integrations/supabase/client';

interface CalorieEntry {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  created_at: string;
}

const CalorieTracker = () => {
  const { profile } = useUser();
  const { toast } = useToast();
  const [entries, setEntries] = useState<CalorieEntry[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newEntry, setNewEntry] = useState({
    name: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  });
  const [dailyStats, setDailyStats] = useState({
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0,
    calorieGoal: 2000 // Default goal
  });

  // Load calorie entries and user's goal from database
  useEffect(() => {
    const fetchCalorieData = async () => {
      if (!profile?.id) return;
      
      try {
        // Show loading state
        toast({
          title: "Daten werden geladen",
          description: "Lädt deine Mahlzeiten...",
        });
        
        // Fetch today's entries
        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await supabase
          .from('calorie_entries')
          .select('*')
          .eq('user_id', profile.id)
          .gte('created_at', today)
          .lt('created_at', new Date(new Date().setDate(new Date().getDate() + 1)).toISOString());

        if (error) throw error;

        // Set entries and calculate totals
        if (data) {
          const typedEntries = data as CalorieEntry[];
          setEntries(typedEntries);
          calculateTotals(typedEntries);
          
          // Notify success only if we found entries
          if (typedEntries.length > 0) {
            toast({
              title: "Daten geladen",
              description: `${typedEntries.length} Mahlzeiten für heute gefunden.`,
            });
          }
        }

        // Fetch user's calorie goal
        const { data: userData, error: userError } = await supabase
          .from('user_nutrition')
          .select('calorie_goal')
          .eq('user_id', profile.id)
          .single();

        if (userError && userError.code !== 'PGRST116') throw userError;

        // Set calorie goal if available
        if (userData) {
          setDailyStats(prev => ({
            ...prev,
            calorieGoal: userData.calorie_goal || 2000
          }));
        }
      } catch (error) {
        console.error('Error fetching calorie data:', error);
        toast({
          title: "Fehler beim Laden",
          description: "Deine Mahlzeiten konnten nicht geladen werden.",
          variant: "destructive"
        });
      }
    };

    if (profile && profile.id) {
      fetchCalorieData();
    }
  }, [profile, toast]);

  // Calculate nutrition totals
  const calculateTotals = (entries: CalorieEntry[]) => {
    const totals = entries.reduce((acc, entry) => {
      return {
        totalCalories: acc.totalCalories + (entry.calories || 0),
        totalProtein: acc.totalProtein + (entry.protein || 0),
        totalCarbs: acc.totalCarbs + (entry.carbs || 0),
        totalFat: acc.totalFat + (entry.fat || 0)
      };
    }, {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0
    });

    setDailyStats(prev => ({
      ...prev,
      ...totals
    }));
  };

  // Handle input changes with proper type conversion
  const handleInputChange = (field: string, value: string) => {
    // Convert to number or use 0 if empty
    const numValue = value === '' ? 0 : Number(value);
    
    setNewEntry(prev => ({
      ...prev,
      [field]: field === 'name' ? value : numValue
    }));
  };

  // Add new calorie entry
  const handleAddEntry = async () => {
    // Validate form data
    if (!newEntry.name || newEntry.name.trim() === '') {
      toast({
        title: "Fehlende Eingabe",
        description: "Bitte gib einen Namen für die Mahlzeit ein.",
        variant: "destructive"
      });
      return;
    }
    
    if (newEntry.calories <= 0) {
      toast({
        title: "Ungültige Kalorien",
        description: "Bitte gib einen Wert größer als 0 für Kalorien ein.",
        variant: "destructive"
      });
      return;
    }
    
    if (!profile?.id) {
      toast({
        title: "Nicht angemeldet",
        description: "Du musst angemeldet sein, um Mahlzeiten zu speichern.",
        variant: "destructive"
      });
      return;
    }

    // Prevent multiple submissions
    setIsSubmitting(true);

    // Prevent negative values
    const sanitizedEntry = {
      ...newEntry,
      name: newEntry.name.trim(),
      calories: Math.max(0, newEntry.calories),
      protein: Math.max(0, newEntry.protein),
      carbs: Math.max(0, newEntry.carbs),
      fat: Math.max(0, newEntry.fat)
    };

    try {
      // Show loading state
      toast({
        title: "Wird gespeichert",
        description: "Deine Mahlzeit wird gespeichert...",
      });
      
      // Create the entry in database
      const { data, error } = await supabase
        .from('calorie_entries')
        .insert([{
          user_id: profile.id,
          name: sanitizedEntry.name,
          calories: sanitizedEntry.calories,
          protein: sanitizedEntry.protein,
          carbs: sanitizedEntry.carbs,
          fat: sanitizedEntry.fat
        }])
        .select();

      if (error) {
        console.error('Error details:', error);
        throw error;
      }

      if (data && data.length > 0) {
        // Add new entry to state
        const newEntryWithId = data[0] as CalorieEntry;
        const newEntries = [...entries, newEntryWithId];
        
        setEntries(newEntries);
        calculateTotals(newEntries);

        toast({
          title: "Eintrag hinzugefügt",
          description: `${sanitizedEntry.name} mit ${sanitizedEntry.calories} Kalorien wurde hinzugefügt.`
        });

        // Reset form
        setNewEntry({
          name: '',
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0
        });
        setShowAddForm(false);
      } else {
        throw new Error("Keine Daten vom Server erhalten");
      }
    } catch (error: any) {
      console.error('Error adding entry:', error);
      toast({
        title: "Fehler",
        description: "Der Eintrag konnte nicht gespeichert werden: " + (error.message || "Unbekannter Fehler"),
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate pie chart data
  const macroData = [
    { name: 'Protein', value: dailyStats.totalProtein * 4, color: '#10B981' }, // 4 calories per gram of protein
    { name: 'Carbs', value: dailyStats.totalCarbs * 4, color: '#3B82F6' },    // 4 calories per gram of carbs
    { name: 'Fett', value: dailyStats.totalFat * 9, color: '#F59E0B' }        // 9 calories per gram of fat
  ];

  return (
    <section className="mb-8">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Kalorientracker</h2>
          <p className="text-muted-foreground">Verfolge deine tägliche Ernährung</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowAddForm(!showAddForm)}
          className="transition-all duration-200 hover:bg-primary hover:text-primary-foreground"
        >
          <Plus className="mr-1 h-4 w-4" />
          Mahlzeit
        </Button>
      </div>

      {showAddForm && (
        <Card className="mb-4 animate-in fade-in slide-in-from-top duration-300">
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="col-span-2">
                <Label htmlFor="food-name">Mahlzeit</Label>
                <Input 
                  id="food-name" 
                  placeholder="z.B. Frühstück, Mittagessen" 
                  value={newEntry.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="calories">Kalorien</Label>
                <Input 
                  id="calories" 
                  type="number" 
                  min="0"
                  value={newEntry.calories || ''}
                  onChange={(e) => handleInputChange('calories', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="protein">Protein (g)</Label>
                <Input 
                  id="protein" 
                  type="number" 
                  min="0"
                  value={newEntry.protein || ''}
                  onChange={(e) => handleInputChange('protein', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="carbs">Kohlenhydrate (g)</Label>
                <Input 
                  id="carbs" 
                  type="number" 
                  min="0"
                  value={newEntry.carbs || ''}
                  onChange={(e) => handleInputChange('carbs', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="fat">Fett (g)</Label>
                <Input 
                  id="fat" 
                  type="number" 
                  min="0"
                  value={newEntry.fat || ''}
                  onChange={(e) => handleInputChange('fat', e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button 
                onClick={() => setShowAddForm(false)} 
                variant="ghost" 
                className="mr-2"
                disabled={isSubmitting}
              >
                Abbrechen
              </Button>
              <Button 
                onClick={handleAddEntry} 
                className="relative overflow-hidden group"
                disabled={isSubmitting}
              >
                <span className="absolute inset-0 bg-primary/10 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                <span className="relative">{isSubmitting ? 'Speichern...' : 'Hinzufügen'}</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="col-span-1 md:col-span-2 transition-all duration-300 hover:shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Heute</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-2">
              <div className="w-full bg-muted rounded-full h-4 mb-2 overflow-hidden">
                <div 
                  className={`h-4 rounded-full transition-all duration-700 ease-out ${
                    dailyStats.totalCalories > dailyStats.calorieGoal 
                      ? 'bg-destructive' 
                      : 'bg-primary'
                  }`}
                  style={{ width: `${Math.min(100, (dailyStats.totalCalories / dailyStats.calorieGoal) * 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium">{dailyStats.totalCalories} kcal</span>
                <span className="text-muted-foreground">{dailyStats.calorieGoal} kcal Ziel</span>
              </div>
              
              <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">Protein</span>
                  <span className="font-semibold">{dailyStats.totalProtein}g</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">Kohlenhydrate</span>
                  <span className="font-semibold">{dailyStats.totalCarbs}g</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">Fett</span>
                  <span className="font-semibold">{dailyStats.totalFat}g</span>
                </div>
              </div>
            </div>

            {entries.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground animate-pulse">
                <Utensils className="mx-auto h-8 w-8 mb-2 opacity-50" />
                <p>Keine Mahlzeiten für heute eingetragen.</p>
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                {entries.map((entry) => (
                  <div 
                    key={entry.id} 
                    className="flex justify-between p-2 bg-muted/30 rounded hover:bg-muted/50 transition-all animate-in fade-in duration-300"
                  >
                    <div className="flex items-center">
                      <Apple className="h-5 w-5 mr-2 text-primary" />
                      <span>{entry.name}</span>
                    </div>
                    <span className="font-medium">{entry.calories} kcal</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="transition-all duration-300 hover:shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Makronährstoffe</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="h-[150px] w-full">
              {dailyStats.totalCalories > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={macroData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                      animationBegin={200}
                      animationDuration={800}
                    >
                      {macroData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${Math.round(value as number)} kcal`} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <p className="text-sm text-center">Füge Mahlzeiten hinzu, um deine Makroverteilung zu sehen</p>
                </div>
              )}
            </div>
            <div className="flex justify-center w-full gap-4 mt-4">
              {macroData.map((entry, index) => (
                <div key={`legend-${index}`} className="flex items-center">
                  <div style={{ backgroundColor: entry.color }} className="w-3 h-3 rounded-full mr-1"></div>
                  <span className="text-xs">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default CalorieTracker;
