import { toast } from "sonner";
import { Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldDescription,
} from "@/components/ui/field";
import {
  ColorPicker,
  DEFAULT_COMMUNITY_PRESETS,
} from "@/components/ui/color-picker";
import { getErrorMessage } from "@/api/types";
import { useForm } from "@/hooks/useForm";
import { usePermissions } from "@/hooks/usePermissions";
import {
  updateCommunitySchema,
  type UpdateCommunityFormData,
} from "../schemas/communitySchemas";
import { useUpdateCommunity } from "../api/updateCommunity";
import type { Community } from "../api/types";

interface CommunitySettingsModalProps {
  community: Community;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommunitySettingsModal({
  community,
  open,
  onOpenChange,
}: CommunitySettingsModalProps) {
  const { canVerifyCommunity } = usePermissions();
  const updateMutation = useUpdateCommunity();

  const form = useForm<UpdateCommunityFormData>({
    initialValues: {
      name: community.name,
      slug: community.slug,
      description: community.description,
      readme: community.readme ?? "",
      backgroundColor:
        community.backgroundColor || DEFAULT_COMMUNITY_PRESETS[0]!,
      verified: community.verified,
      newOwnerUsername: "",
    },
    schema: updateCommunitySchema,
    validateOnBlur: true,
    onSubmit: async (values) => {
      try {
        const payload: UpdateCommunityFormData = {
          name: values.name?.trim(),
          slug: values.slug?.trim(),
          description: values.description?.trim(),
          readme: values.readme?.trim() || undefined,
          backgroundColor: values.backgroundColor,
          verified: canVerifyCommunity ? values.verified : undefined,
          newOwnerUsername: values.newOwnerUsername?.trim() || undefined,
        };

        const updated = await updateMutation.mutateAsync({
          communitySlug: community.slug,
          payload,
        });

        toast.success(`Community "${updated.name}" updated successfully!`);
        onOpenChange(false);
      } catch (err: unknown) {
        const message = getErrorMessage(err, "Failed to update community.");
        toast.error(message);
        form.setServerError(message);
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Community Settings</DialogTitle>
          <DialogDescription>
            Update details, identifier, and theme configuration for {community.name}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit} className="space-y-4 pt-2">
          {form.serverError && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive font-medium">
              {form.serverError}
            </div>
          )}

          <Field>
            <FieldLabel htmlFor="editName">Community Name</FieldLabel>
            <Input
              id="editName"
              value={form.values.name ?? ""}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
              aria-invalid={form.isInvalid("name")}
            />
            <FieldError errors={[{ message: form.errors.name }]} />
          </Field>

          <Field>
            <FieldLabel htmlFor="editSlug">
              Slug (URL identifier)
            </FieldLabel>
            <Input
              id="editSlug"
              value={form.values.slug ?? ""}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
              aria-invalid={form.isInvalid("slug")}
              className="font-mono text-xs"
            />
            <FieldDescription>
              Warning: Changing the slug updates all bookmark URLs.
            </FieldDescription>
            <FieldError errors={[{ message: form.errors.slug }]} />
          </Field>

          <Field>
            <FieldLabel htmlFor="editDescription">Description</FieldLabel>
            <Textarea
              id="editDescription"
              rows={3}
              value={form.values.description ?? ""}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
              aria-invalid={form.isInvalid("description")}
              maxLength={1000}
            />
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>Summary shown in banners and cards.</span>
              <span>{(form.values.description ?? "").length} / 1000</span>
            </div>
            <FieldError errors={[{ message: form.errors.description }]} />
          </Field>

          <Field>
            <FieldLabel>Theme Accent & Gradient</FieldLabel>
            <ColorPicker
              value={form.values.backgroundColor}
              onChange={(hex) => form.setValue("backgroundColor", hex)}
            />
          </Field>

          {canVerifyCommunity && (
            <div className="flex items-center justify-between rounded-xl border border-border/80 bg-muted/20 p-3.5">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-foreground">
                  Verified Community Status
                </span>
                <p className="text-xs text-muted-foreground">
                  Grant this community an official verified badge.
                </p>
              </div>
              <Switch
                checked={Boolean(form.values.verified)}
                onCheckedChange={(checked) =>
                  form.setValue("verified", checked)
                }
              />
            </div>
          )}

          <Field>
            <FieldLabel htmlFor="newOwnerUsername">
              Transfer Ownership (Optional)
            </FieldLabel>
            <Input
              id="newOwnerUsername"
              placeholder="Enter target username"
              value={form.values.newOwnerUsername ?? ""}
              onChange={form.handleChange}
              className="text-xs"
            />
            <FieldDescription>
              Transferring ownership will grant full administrator rights
              to the designated user.
            </FieldDescription>
          </Field>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={form.isSubmitting || updateMutation.isPending}
              className="gap-1.5 font-bold cursor-pointer"
            >
              <Check className="size-4" />
              {form.isSubmitting || updateMutation.isPending
                ? "Saving Changes..."
                : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
