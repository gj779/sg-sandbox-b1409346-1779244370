
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
