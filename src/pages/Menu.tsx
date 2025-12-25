import { useEffect, useMemo, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useLocale } from "@/contexts/LocaleContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Search,
  GripVertical,
  Trash2,
  Send,
  Check,
  Clock,
  Utensils,
  Sparkles,
  Save,
  RefreshCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MenuItem {
  id: number;
  name: string;
  nameAr: string;
  calories: number;
  protein: number;
  category: string;
  available: boolean;
}

interface MenuTemplate {
  id: string;
  name: string;
  description?: string;
  items: MenuItem[];
  lastUsed?: string;
}

const FOOD_CATEGORIES = ["Meats", "Carb", "Veg", "Sauces"] as const;

const seededCatalog: MenuItem[] = [
  { id: 1, name: "Grilled Chicken", nameAr: "دجاج مشوي", calories: 320, protein: 45, category: "Meats", available: true },
  { id: 2, name: "Butter Chicken", nameAr: "دجاج بالزبدة", calories: 540, protein: 38, category: "Meats", available: true },
  { id: 3, name: "Orange Chicken", nameAr: "دجاج بالبرتقال", calories: 510, protein: 36, category: "Meats", available: true },
  { id: 4, name: "Fish Fillet", nameAr: "فيليه سمك", calories: 330, protein: 34, category: "Meats", available: true },
  { id: 5, name: "Basmati Rice", nameAr: "أرز بسمتي", calories: 210, protein: 5, category: "Carb", available: true },
  { id: 6, name: "Garlic Butter Pasta", nameAr: "مكرونة بالثوم والزبدة", calories: 420, protein: 14, category: "Carb", available: true },
  { id: 7, name: "Herbed Potatoes", nameAr: "بطاطس بالأعشاب", calories: 260, protein: 6, category: "Carb", available: true },
  { id: 8, name: "Roasted Veg Mix", nameAr: "خضار مشوية", calories: 190, protein: 7, category: "Veg", available: true },
  { id: 9, name: "Steamed Broccoli", nameAr: "بروكلي مطهو على البخار", calories: 80, protein: 5, category: "Veg", available: true },
  { id: 10, name: "Honey Glazed Carrots", nameAr: "جزر بالعسل", calories: 140, protein: 2, category: "Veg", available: true },
  { id: 11, name: "Garlic Yogurt Sauce", nameAr: "صلصة زبادي بالثوم", calories: 90, protein: 4, category: "Sauces", available: true },
  { id: 12, name: "Tahini Sauce", nameAr: "طحينة", calories: 120, protein: 3, category: "Sauces", available: true },
];

const mealsById = (ids: number[], catalog: MenuItem[]) =>
  ids
    .map((id) => catalog.find((meal) => meal.id === id))
    .filter(Boolean)
    .map((meal) => ({ ...meal! }));

const defaultTemplates: MenuTemplate[] = [
  {
    id: "balanced-day",
    name: "Balanced Day",
    description: "Lean protein, greens, and a light finish",
    items: mealsById([1, 5, 8, 11], seededCatalog),
    lastUsed: new Date().toISOString(),
  },
  {
    id: "vegetarian-vibes",
    name: "Vegetarian Vibes",
    description: "Plant-forward, satisfying, and fiber rich",
    items: mealsById([8, 9, 10, 12], seededCatalog),
  },
  {
    id: "mediterranean",
    name: "Mediterranean",
    description: "Citrus, herbs, and healthy fats",
    items: mealsById([2, 5, 8, 11], seededCatalog),
  },
];

const TEMPLATE_STORAGE_KEY = "nh-menu-templates";
const TODAY_MENU_STORAGE_KEY = "nh-today-menu";

const MenuPage = () => {
  const { t, locale } = useLocale();
  const [search, setSearch] = useState("");
  const [todayMenu, setTodayMenu] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(t("menuPage.categoryAll"));
  const [catalog, setCatalog] = useState<MenuItem[]>(seededCatalog);
  const [templates, setTemplates] = useState<MenuTemplate[]>(defaultTemplates);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [isTemplateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateNotes, setTemplateNotes] = useState("");
  const [draftItem, setDraftItem] = useState<Omit<MenuItem, "id">>({
    name: "",
    nameAr: "",
    calories: 0,
    protein: 0,
    category: FOOD_CATEGORIES[0],
    available: true,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const storedTemplates = localStorage.getItem(TEMPLATE_STORAGE_KEY);
      const storedMenu = localStorage.getItem(TODAY_MENU_STORAGE_KEY);

      if (storedTemplates) setTemplates(JSON.parse(storedTemplates));
      if (storedMenu) setTodayMenu(JSON.parse(storedMenu));
    } catch (err) {
      console.error("Failed to read saved menu data", err);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(TODAY_MENU_STORAGE_KEY, JSON.stringify(todayMenu));
  }, [todayMenu]);

  const categories = useMemo(() => [t("menuPage.categoryAll"), ...FOOD_CATEGORIES], [t]);

  const filteredMeals = useMemo(() => {
    return catalog.filter((meal) => {
      const matchesSearch =
        meal.name.toLowerCase().includes(search.toLowerCase()) ||
        meal.nameAr.includes(search);
      const matchesCategory = selectedCategory === t("menuPage.categoryAll") || meal.category === selectedCategory;
      const notInTodayMenu = !todayMenu.find((m) => m.id === meal.id);
      return matchesSearch && matchesCategory && notInTodayMenu && meal.available;
    });
  }, [catalog, search, selectedCategory, todayMenu, t]);

  const addToMenu = (meal: MenuItem) => setTodayMenu([...todayMenu, { ...meal }]);

  const removeFromMenu = (mealId: number) => setTodayMenu(todayMenu.filter((m) => m.id !== mealId));

  const handleApplyTemplate = () => {
    if (!selectedTemplateId) return;
    const template = templates.find((tpl) => tpl.id === selectedTemplateId);
    if (!template) return;

    setTodayMenu(template.items.map((item) => ({ ...item })));
    const now = new Date().toISOString();
    setTemplates((prev) =>
      prev.map((tpl) => (tpl.id === template.id ? { ...tpl, lastUsed: now } : tpl)),
    );
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim() || todayMenu.length === 0) return;
    const now = new Date().toISOString();
    const newTemplate: MenuTemplate = {
      id: typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `tpl-${Date.now()}`,
      name: templateName.trim(),
      description: templateNotes.trim() || undefined,
      items: todayMenu.map((item) => ({ ...item })),
      lastUsed: now,
    };

    setTemplates((prev) => [newTemplate, ...prev]);
    setSelectedTemplateId(newTemplate.id);
    setTemplateDialogOpen(false);
    setTemplateName("");
    setTemplateNotes("");
  };

  const handleUpdateTemplate = () => {
    if (!selectedTemplateId || todayMenu.length === 0) return;
    setTemplates((prev) =>
      prev.map((tpl) =>
        tpl.id === selectedTemplateId
          ? { ...tpl, items: todayMenu.map((item) => ({ ...item })), lastUsed: tpl.lastUsed ?? new Date().toISOString() }
          : tpl,
      ),
    );
  };

  const handleResetMenu = () => setTodayMenu([]);

  const handleCreateItem = () => {
    if (!draftItem.name.trim() || !draftItem.nameAr.trim()) return;
    const id = catalog.length ? Math.max(...catalog.map((m) => m.id)) + 1 : 1;
    const newItem: MenuItem = { id, ...draftItem };
    setCatalog((prev) => [newItem, ...prev]);
    setDraftItem({ ...draftItem, name: "", nameAr: "", calories: 0, protein: 0 });
  };

  const selectedTemplate = templates.find((tpl) => tpl.id === selectedTemplateId);

  const today = new Date().toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("menuPage.title")}</h1>
            <p className="text-muted-foreground">{today}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <Clock className="h-4 w-4" />
              {t("menuPage.schedule")}
            </Button>
            <Button className="gap-2 bg-gradient-primary hover:opacity-90">
              <Send className="h-4 w-4" />
              {t("menuPage.sendToCustomers")}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="shadow-soft">
            <CardHeader className="pb-4 space-y-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Utensils className="h-5 w-5 text-primary" />
                  {t("todayMenu.title")}
                </CardTitle>
                <Badge variant="secondary" className="font-normal">
                  {t("menuPage.itemsCount", { count: todayMenu.length })}
                </Badge>
              </div>

              <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm text-muted-foreground">{t("menuPage.templateLabel")}</Label>
                    {selectedTemplate?.lastUsed && (
                      <span className="text-xs text-muted-foreground">
                        {t("menuPage.lastUsed", {
                          date: new Date(selectedTemplate.lastUsed).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", {
                            month: "short",
                            day: "numeric",
                          }),
                        })}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                      <SelectTrigger className="sm:min-w-[220px]">
                        <SelectValue placeholder={t("menuPage.chooseTemplate")} />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map((tpl) => (
                          <SelectItem key={tpl.id} value={tpl.id}>
                            <div className="flex flex-col">
                              <span>{tpl.name}</span>
                              {tpl.description && (
                                <span className="text-xs text-muted-foreground">{tpl.description}</span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="secondary"
                      className="gap-2"
                      onClick={handleApplyTemplate}
                      disabled={!selectedTemplateId}
                    >
                      <Sparkles className="h-4 w-4" />
                      {t("menuPage.apply")}
                    </Button>
                    <Button variant="ghost" className="gap-2" onClick={handleResetMenu}>
                      <RefreshCcw className="h-4 w-4" />
                      {t("menuPage.clear")}
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 justify-end">
                  <Dialog open={isTemplateDialogOpen} onOpenChange={setTemplateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <Save className="h-4 w-4" />
                        {t("menuPage.saveAsTemplate")}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{t("menuPage.saveTemplateTitle")}</DialogTitle>
                        <DialogDescription>
                          {t("menuPage.saveTemplateDesc")}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <Label>{t("menuPage.templateName")}</Label>
                          <Input
                            value={templateName}
                            onChange={(e) => setTemplateName(e.target.value)}
                            placeholder={t("menuPage.templateName")}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>{t("menuPage.templateNotes")}</Label>
                          <Textarea
                            value={templateNotes}
                            onChange={(e) => setTemplateNotes(e.target.value)}
                            placeholder={t("menuPage.templateNotes")}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Templates are reusable; changing today's menu will not change saved templates.
                        </p>
                      </div>
                      <DialogFooter>
                        <Button
                          onClick={handleSaveTemplate}
                          disabled={!templateName.trim() || todayMenu.length === 0}
                          className="bg-gradient-primary hover:opacity-90"
                        >
                          {t("menuPage.saveAsTemplate")}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Button
                    variant="outline"
                    className="gap-2"
                    disabled={!selectedTemplateId || todayMenu.length === 0}
                    onClick={handleUpdateTemplate}
                  >
                    <Check className="h-4 w-4" />
                    {t("common.buttons.update")}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {t("menuPage.applyTemplateHint")}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {todayMenu.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-muted/40 px-4 py-3">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Badge variant="outline">{t("menuPage.wideView")}</Badge>
                    <span>{t("menuPage.optimizedFor")}</span>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <span className="font-medium">
                      {todayMenu.reduce((sum, m) => sum + m.calories, 0)} {t("menuPage.totalCalories")}
                    </span>
                    <span className="font-medium">
                      {todayMenu.reduce((sum, m) => sum + m.protein, 0)}g {t("menuPage.protein")}
                    </span>
                  </div>
                </div>
              )}

              {todayMenu.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Utensils className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>{t("menuPage.empty")}</p>
                  <p className="text-sm">{t("menuPage.addMealsHint")}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {todayMenu.map((meal, index) => (
                    <div
                      key={`${meal.id}-${index}`}
                      className="menu-item-card flex items-center gap-3 animate-scale-in"
                      style={{ animationDelay: `${index * 25}ms` }}
                    >
                      <GripVertical className="h-4 w-4 text-muted-foreground/50 cursor-grab" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{meal.name}</p>
                        <p className="text-sm text-muted-foreground font-cairo truncate">{meal.nameAr}</p>
                      </div>
                      <div className="text-right text-sm">
                        <p className="font-medium">{meal.calories} cal</p>
                        <p className="text-muted-foreground">{meal.protein}g protein</p>
                      </div>
                      <Badge variant="outline" className="whitespace-nowrap">{meal.category}</Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => removeFromMenu(meal.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="pb-4">
              <CardTitle>{t("menuPage.catalogTitle")}</CardTitle>
              <div className="flex flex-col lg:flex-row gap-3 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder={t("menuPage.searchPlaceholder")}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {categories.map((cat) => (
                    <Button
                      key={cat}
                      variant={selectedCategory === cat ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(cat)}
                      className={cn(selectedCategory === cat && "bg-gradient-primary")}
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                <div className="space-y-2 p-3 rounded-lg border bg-muted/30">
                  <p className="text-sm font-medium">{t("menuPage.createItem")}</p>
                  <div className="space-y-2">
                    <Input
                      placeholder={t("menuPage.nameEn")}
                      value={draftItem.name}
                      onChange={(e) => setDraftItem({ ...draftItem, name: e.target.value })}
                    />
                    <Input
                      placeholder={t("menuPage.nameAr")}
                      value={draftItem.nameAr}
                      onChange={(e) => setDraftItem({ ...draftItem, nameAr: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        min={0}
                        placeholder={t("menuPage.calories")}
                        value={draftItem.calories}
                        onChange={(e) => setDraftItem({ ...draftItem, calories: Number(e.target.value) })}
                      />
                      <Input
                        type="number"
                        min={0}
                        placeholder={t("menuPage.protein")}
                        value={draftItem.protein}
                        onChange={(e) => setDraftItem({ ...draftItem, protein: Number(e.target.value) })}
                      />
                    </div>
                    <Select
                      value={draftItem.category}
                      onValueChange={(val) => setDraftItem({ ...draftItem, category: val })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("menuPage.category")}/>
                      </SelectTrigger>
                      <SelectContent>
                        {FOOD_CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button className="w-full bg-gradient-primary" onClick={handleCreateItem}>
                      {t("menuPage.addToCatalog")}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                {filteredMeals.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>{t("menuPage.noItems")}</p>
                  </div>
                ) : (
                  filteredMeals.map((meal) => (
                    <div
                      key={meal.id}
                      className="menu-item-card flex items-center gap-3 cursor-pointer"
                      onClick={() => addToMenu(meal)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{meal.name}</p>
                        <p className="text-sm text-muted-foreground font-cairo">{meal.nameAr}</p>
                      </div>
                      <div className="text-right text-sm">
                        <p className="font-medium">{meal.calories} cal</p>
                      </div>
                      <Badge variant="outline">{meal.category}</Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-primary hover:bg-primary/10"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default MenuPage;
