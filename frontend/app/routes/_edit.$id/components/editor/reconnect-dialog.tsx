import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  RiRefreshIcon,
} from "natmfat";

// @todo debounce & use valtio status

export function ReconnectDialog(args: { open: boolean }) {
  return (
    <Dialog open={args.open}>
      <DialogContent className="gap-3 [&>[aria-label='Close']]:hidden">
        <DialogTitle>Please Refresh</DialogTitle>
        <DialogDescription>
          Your connection to Tinypad was interrupted.
        </DialogDescription>

        <Button
          color="primary"
          onClick={() => {
            location.reload();
          }}
        >
          <RiRefreshIcon />
          Refresh
        </Button>
      </DialogContent>
    </Dialog>
  );
}
