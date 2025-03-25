import { NavHeader } from "@/components/nav-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Phone, MessageSquare } from "lucide-react";

const contactFormSchema = z.object({
  name: z.string().min(2, "Navn må være minst 2 tegn"),
  email: z.string().email("Ugyldig e-postadresse"),
  subject: z.string().min(3, "Emne må være minst 3 tegn"),
  message: z.string().min(10, "Meldingen må være minst 10 tegn"),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function Contact() {
  const { toast } = useToast();
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormValues) => {
    try {
      // Send e-post til support
      await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: "andreas.ottem@icloud.com",
          from: data.email,
          subject: `BNKA Support: ${data.subject}`,
          text: `Fra: ${data.name}\nE-post: ${data.email}\n\nMelding:\n${data.message}`,
        }),
      });

      toast({
        title: "Melding sendt",
        description: "Vi vil svare deg så snart som mulig.",
      });

      form.reset();
    } catch (error) {
      toast({
        title: "Feil",
        description: "Kunne ikke sende meldingen. Prøv igjen senere.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavHeader />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-12 dark:text-white">Kontakt oss</h1>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Phone className="h-8 w-8 mx-auto mb-4 text-primary" />
                  <h3 className="font-semibold mb-2 dark:text-white">Telefon</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    +47 815 22 000
                    <br />
                    Man-Fre: 08:00-16:00
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Mail className="h-8 w-8 mx-auto mb-4 text-primary" />
                  <h3 className="font-semibold mb-2 dark:text-white">E-post</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    support@styr.no
                    <br />
                    Svar innen 24 timer
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="pt-6">
                <div className="text-center">
                  <MessageSquare className="h-8 w-8 mx-auto mb-4 text-primary" />
                  <h3 className="font-semibold mb-2 dark:text-white">Live Chat</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Tilgjengelig 24/7
                    <br />
                    Via vår app
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="max-w-2xl mx-auto dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">Send oss en melding</CardTitle>
              <CardDescription className="dark:text-gray-400">
                Fyll ut skjemaet under, så vil vi kontakte deg så snart som mulig
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Navn</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-post</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Emne</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Melding</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            className="min-h-[120px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Send melding
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
