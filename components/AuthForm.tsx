"use client";

import { z } from "zod";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { auth } from "@/firebase/client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
} from "firebase/auth";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

import { signIn, signUp } from "@/lib/actions/auth.action";
import FormField from "./FormField";

const authFormSchema = (type: FormType) => {
  return z.object({
    name: type === "sign-up" ? z.string().min(3) : z.string().optional(),
    email: z.string().email(),
    password: z.string().min(3),
  });
};

const AuthForm = ({ type }: { type: FormType }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const formSchema = authFormSchema(type);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      if (type === "sign-up") {
        const { name, email, password } = data;

        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        const result = await signUp({
          uid: userCredential.user.uid,
          name: name!,
          email,
          password,
        });

        if (!result.success) {
          toast.error(result.message);
          setIsLoading(false);
          return;
        }

        toast.success("Account created successfully. Redirecting to sign in...");
        setIsRedirecting(true);
        router.push("/sign-in");
      } else {
        const { email, password } = data;

        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        const idToken = await userCredential.user.getIdToken();
        if (!idToken) {
          toast.error("Sign in Failed. Please try again.");
          setIsLoading(false);
          return;
        }

        await signIn({
          email,
          idToken,
        });

        toast.success("Signed in successfully. Redirecting to your dashboard...");
        setIsRedirecting(true);
        router.push("/");
      }
    } catch (error) {
      console.log(error);
      toast.error(`There was an error: ${error}`);
      setIsLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: "google" | "github") => {
    setIsLoading(true);
    try {
      const authProvider =
        provider === "google" ? new GoogleAuthProvider() : new GithubAuthProvider();
      const userCredential = await signInWithPopup(auth, authProvider);
      const { user } = userCredential;
      const idToken = await user.getIdToken();

      // Save user to DB if new
      await signUp({
        uid: user.uid,
        name: user.displayName || "User",
        email: user.email!,
        password: "",
      });

      await signIn({ email: user.email!, idToken });
      toast.success("Signed in successfully. Redirecting to your dashboard...");
      setIsRedirecting(true);
      router.push("/");
    } catch (error: any) {
      toast.error(error.message || "Social sign-in failed.");
      setIsLoading(false);
    }
  };

  const isSignIn = type === "sign-in";

  return (
    <div className="card-border lg:min-w-[566px]">
      <div className="flex flex-col gap-6 card py-14 px-10">
        <div className="flex flex-row gap-2 justify-center">
          <Image src="/logo.svg" alt="InterV Logo" height={32} width={38} />
          <h2 className="gradient-text">InterV</h2>
        </div>

        <h3>Ace your next interview with AI on your side</h3>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-6 mt-4 form"
          >
            {!isSignIn && (
              <FormField
                control={form.control}
                name="name"
                label="Name"
                placeholder="Your Name"
                type="text"
              />
            )}

            <FormField
              control={form.control}
              name="email"
              label="Email"
              placeholder="Your email address"
              type="email"
            />

            <FormField
              control={form.control}
              name="password"
              label="Password"
              placeholder="Enter your password"
              type="password"
            />

            <Button className="btn" type="submit" disabled={isLoading}>
              {isRedirecting
                ? "Redirecting..."
                : isLoading
                  ? isSignIn
                    ? "Signing In..."
                    : "Creating Account..."
                  : isSignIn
                    ? "Sign In"
                    : "Create an Account"}
            </Button>
          </form>
        </Form>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-light-600" />
          <span className="text-light-400 text-sm">or continue with</span>
          <div className="flex-1 h-px bg-light-600" />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => handleSocialSignIn("google")}
            disabled={isLoading}
            className="flex flex-1 items-center justify-center gap-2 bg-dark-200 hover:bg-dark-300 border border-light-600/30 rounded-full min-h-12 font-semibold text-sm text-white transition-colors disabled:opacity-60 cursor-pointer"
          >
            <Image src="/google.svg" alt="Google" width={20} height={20} />
            {isRedirecting ? "Redirecting..." : "Google"}
          </button>
          <button
            type="button"
            onClick={() => handleSocialSignIn("github")}
            disabled={isLoading}
            className="flex flex-1 items-center justify-center gap-2 bg-dark-200 hover:bg-dark-300 border border-light-600/30 rounded-full min-h-12 font-semibold text-sm text-white transition-colors disabled:opacity-60 cursor-pointer"
          >
            <Image src="/github.svg" alt="GitHub" width={20} height={20} />
            {isRedirecting ? "Redirecting..." : "GitHub"}
          </button>
        </div>

        <p className="text-center">
          {isSignIn ? "No account yet?" : "Have an account already?"}
          <Link
            href={!isSignIn ? "/sign-in" : "/sign-up"}
            className="font-bold text-user-primary ml-1"
          >
            {!isSignIn ? "Sign In" : "Sign Up"}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
