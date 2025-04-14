
import { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/contexts/UserContext";
import { Building, Clock, DollarSign, MapPin, Phone, Globe, UtensilsCrossed } from "lucide-react";
import Image from "next/image";

// Form schema
const formSchema = z.object({
  restaurantName: z.string().min(2, "Restaurant name must be at least 2 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  cuisineType: z.string().min(1, "Please select a cuisine type."),
  address: z.string().min(5, "Address must be at least 5 characters."),
  city: z.string().min(2, "City must be at least 2 characters."),
  state: z.string().min(2, "State must be at least 2 characters."),
  zipCode: z.string().min(5, "Zip code must be at least 5 characters."),
  phone: z.string().min(10, "Phone number must be at least 10 characters."),
  website: z.string().url("Please enter a valid URL.").or(z.string().length(0)),
  openingHours: z.string().min(1, "Please enter opening hours."),
  closingHours: z.string().min(1, "Please enter closing hours."),
  acceptsReservations: z.boolean().default(false),
  hasDelivery: z.boolean().default(false),
  hasTakeout: z.boolean().default(false),
  priceRange: z.string().min(1, "Please select a price range."),
  coverImage: z.string().optional(),
});

export default function RestaurantSetupProfile() {
  const { user, userProfile, isAuthenticated, isLoading } = useUser();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);

  // Create a form instance with the appropriate schema
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      restaurantName: user?.displayName || "",
      description: "",
      cuisineType: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      phone: "",
      website: "",
      openingHours: "",
      closingHours: "",
      acceptsReservations: false,
      hasDelivery: false,
      hasTakeout: false,
      priceRange: "$$",
      coverImage: "",
    },
  });

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      console.log("Form values:", values);
      
      // Here you would typically save the data to Firebase
      // For now, we'll just simulate a successful submission
      setTimeout(() => {
        setIsSubmitting(false);
        router.push("/restaurant/dashboard");
      }, 1500);
    } catch (error) {
      console.error("Error submitting form:", error);
      setIsSubmitting(false);
    }
  };

  // Handle cover image upload
  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
        form.setValue("coverImage", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Redirect if not authenticated
  if (!isLoading && !isAuthenticated) {
    router.push("/auth/login?redirect=/restaurant/setup-profile");
    return null;
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="container py-12 flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Setup Restaurant Profile | StaffSpace</title>
        <meta name="description" content="Complete your restaurant profile on StaffSpace to start hiring staff." />
      </Head>

      <div className="container py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Setup Your Restaurant Profile</h1>
            <p className="text-muted-foreground">
              Complete your profile to start posting jobs and finding staff
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Restaurant Information</CardTitle>
              <CardDescription>
                Provide details about your restaurant to help potential staff learn more about your establishment.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Cover Image */}
                  <div className="mb-6">
                    <FormLabel>Restaurant Cover Image</FormLabel>
                    <div className="mt-2">
                      {coverImagePreview ? (
                        <div className="relative w-full h-48 mb-4">
                          <Image
                            src={coverImagePreview}
                            alt="Restaurant cover"
                            fill
                            className="rounded-md object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-48 bg-muted rounded-md flex items-center justify-center mb-4">
                          <Building className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverImageChange}
                        className="cursor-pointer"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Upload a high-quality image of your restaurant (recommended size: 1200x400px)
                      </p>
                    </div>
                  </div>

                  {/* Basic Information */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="restaurantName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Restaurant Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. La Bistro" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cuisineType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cuisine Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select cuisine type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="italian">Italian</SelectItem>
                              <SelectItem value="french">French</SelectItem>
                              <SelectItem value="american">American</SelectItem>
                              <SelectItem value="mexican">Mexican</SelectItem>
                              <SelectItem value="japanese">Japanese</SelectItem>
                              <SelectItem value="chinese">Chinese</SelectItem>
                              <SelectItem value="indian">Indian</SelectItem>
                              <SelectItem value="thai">Thai</SelectItem>
                              <SelectItem value="mediterranean">Mediterranean</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Restaurant Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell potential staff about your restaurant, its atmosphere, and what makes it special..."
                            className="min-h-32"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Location Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Location & Contact</h3>

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street Address</FormLabel>
                          <FormControl>
                            <Input placeholder="123 Main St" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid gap-4 md:grid-cols-3">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="New York" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State</FormLabel>
                            <FormControl>
                              <Input placeholder="NY" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="zipCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Zip Code</FormLabel>
                            <FormControl>
                              <Input placeholder="10001" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="(555) 123-4567" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="https://yourrestaurant.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Business Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Business Details</h3>

                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="openingHours"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Opening Hours</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. 11:00 AM" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="closingHours"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Closing Hours</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. 10:00 PM" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="priceRange"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price Range</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select price range" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="$">$ (Inexpensive)</SelectItem>
                              <SelectItem value="$$">$$ (Moderate)</SelectItem>
                              <SelectItem value="$$$">$$$ (Expensive)</SelectItem>
                              <SelectItem value="$$$$">$$$$ (Very Expensive)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid gap-4 md:grid-cols-3">
                      <FormField
                        control={form.control}
                        name="acceptsReservations"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Accepts Reservations</FormLabel>
                              <FormDescription>
                                Do you accept reservations?
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="hasDelivery"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Offers Delivery</FormLabel>
                              <FormDescription>
                                Do you offer delivery?
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="hasTakeout"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Offers Takeout</FormLabel>
                              <FormDescription>
                                Do you offer takeout?
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                          Saving...
                        </>
                      ) : (
                        "Save Profile"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
