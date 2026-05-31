import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { Trash2Icon } from "lucide-react"
import { Button } from "../ui/button";
import { RiDeleteBinLine } from "@remixicon/react";

type Props = {
  buttonLabel: string;
  title: string;
  description?: string;
  onConfirmation: () => void;
  onCancel?: () => void;
}

export function DeleteConfirmationDialog(props: Props) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type="button" variant="ghost"
          className="shrink-0 cursor-pointer"
          size="icon-sm" aria-label={props.buttonLabel}>
          <RiDeleteBinLine />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
            <Trash2Icon />
          </AlertDialogMedia>
          <AlertDialogTitle>{props.title}</AlertDialogTitle>
          {props.description && (
            <AlertDialogDescription>
              {props.description}
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => {
            if (props.onCancel) props.onCancel()
          }} variant="outline">Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => props.onConfirmation()} variant="destructive">Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
