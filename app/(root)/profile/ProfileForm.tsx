"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { updateUserProfile } from "@/lib/actions/auth.action";

interface ProfileFormProps {
  user: { id: string; name: string; email: string; profilePhoto?: string };
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [preview, setPreview] = useState<string>(user.profilePhoto || "/user-avatar.png");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      return;
    }
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        let photoUrl = user.profilePhoto;

        if (selectedFile) {
          const formData = new FormData();
          formData.append("file", selectedFile);
          const res = await fetch("/api/upload", { method: "POST", body: formData });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Upload failed");
          photoUrl = data.url;
        }

        const result = await updateUserProfile({
          uid: user.id,
          name,
          email,
          profilePhoto: photoUrl,
        });

        if (result.success) {
          toast.success("Profile updated successfully!");
        } else {
          toast.error(result.message || "Failed to update profile.");
        }
      } catch (err: any) {
        toast.error(err.message || "Something went wrong.");
      }
    });
  };

  return (
    <section className="flex flex-col items-center gap-8 max-w-xl mx-auto w-full py-10">
      <h2 className="text-primary-100">Edit Profile</h2>

      <div
        className="relative cursor-pointer group"
        onClick={() => fileInputRef.current?.click()}
      >
        <Image
          src={preview}
          alt="Profile photo"
          width={120}
          height={120}
          className="rounded-full object-cover size-[120px] border-2 border-primary-200/50"
        />
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
          <p className="text-xs text-white font-semibold">Change Photo</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      <form onSubmit={handleSubmit} className="form w-full flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <label className="label text-light-100 text-sm">Full Name</label>
          <input
            className="input !bg-dark-200 !rounded-full !min-h-12 !px-5 placeholder:!text-light-100 w-full outline-none text-white"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="label text-light-100 text-sm">Email</label>
          <input
            className="input !bg-dark-200 !rounded-full !min-h-12 !px-5 placeholder:!text-light-100 w-full outline-none text-white"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
          />
        </div>

        <button type="submit" disabled={isPending} className="btn !w-full !bg-primary-200 !text-dark-100 hover:!bg-primary-200/80 !rounded-full !min-h-12 !font-bold cursor-pointer disabled:opacity-60">
          {isPending ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </section>
  );
}
