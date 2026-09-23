ALTER TABLE "category" ADD CONSTRAINT "category_name_unique" UNIQUE("name");--> statement-breakpoint
ALTER TABLE "category" ADD CONSTRAINT "category_display_order_unique" UNIQUE("display_order");--> statement-breakpoint
ALTER TABLE "problem_type" ADD CONSTRAINT "problem_type_name_unique" UNIQUE("name");--> statement-breakpoint
ALTER TABLE "problem_type" ADD CONSTRAINT "problem_type_display_order_unique" UNIQUE("display_order");