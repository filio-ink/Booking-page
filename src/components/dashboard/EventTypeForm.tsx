"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DURATION_OPTIONS, EVENT_COLORS, generateSlug } from "@/lib/utils";

const schema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(500).optional(),
  duration: z.number().int().min(5).max(480),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, hyphens"),
  color: z.string(),
});

type FormData = z.infer<typeof schema>;

interface EventTypeFormProps {
  initialData?: Partial<FormData> & { id?: string };
  onSuccess: () => void;
}

export function EventTypeForm({ initialData, onSuccess }: EventTypeFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initialData?.title ?? "",
      description: initialData?.description ?? "",
      duration: initialData?.duration ?? 30,
      slug: initialData?.slug ?? "",
      color: initialData?.color ?? "#3B82F6",
    },
  });

  const selectedColor = watch("color");
  const titleValue = watch("title");

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue("title", e.target.value);
    if (!initialData?.slug) {
      setValue("slug", generateSlug(e.target.value));
    }
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    try {
      const url = initialData?.id
        ? `/api/event-types/${initialData.id}`
        : "/api/event-types";
      const method = initialData?.id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const json = await res.json();
        setError(JSON.stringify(json.error));
        return;
      }
      onSuccess();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="e.g. 30 Minute Meeting"
          value={titleValue}
          onChange={handleTitleChange}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          placeholder="Brief description of this meeting type"
          {...register("description")}
        />
      </div>

      <div className="space-y-1">
        <Label>Duration</Label>
        <Select
          defaultValue={String(initialData?.duration ?? 30)}
          onValueChange={(v) => setValue("duration", parseInt(v))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select duration" />
          </SelectTrigger>
          <SelectContent>
            {DURATION_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={String(opt.value)}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label htmlFor="slug">URL Slug</Label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            /your-username/
          </span>
          <Input
            id="slug"
            placeholder="30min"
            {...register("slug")}
          />
        </div>
        {errors.slug && (
          <p className="text-sm text-destructive">{errors.slug.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Color</Label>
        <div className="flex flex-wrap gap-2">
          {EVENT_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                selectedColor === color
                  ? "border-gray-900 scale-110"
                  : "border-transparent"
              }`}
              style={{ backgroundColor: color }}
              onClick={() => setValue("color", color)}
            />
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : initialData?.id ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}
