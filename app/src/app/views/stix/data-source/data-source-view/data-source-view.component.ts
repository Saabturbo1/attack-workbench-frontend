import { Component, OnInit } from '@angular/core';
import { DataSource } from 'src/app/classes/stix/data-source';
import { DataComponent } from 'src/app/classes/stix/data-component';
import { RestApiConnectorService } from 'src/app/services/connectors/rest-api/rest-api-connector.service';
import { StixViewPage } from '../../stix-view-page';
import { MatDialog } from '@angular/material/dialog';
import { StixDialogComponent } from '../../stix-dialog/stix-dialog.component';

@Component({
    selector: 'app-data-source-view',
    templateUrl: './data-source-view.component.html',
    styleUrls: ['./data-source-view.component.scss']
})
export class DataSourceViewComponent extends StixViewPage implements OnInit {
    public get data_source(): DataSource { return this.config.object as DataSource; }
    public data_components: DataComponent[] = [];
    public loading = false;

    constructor(public dialog: MatDialog, private restAPIConnectorService: RestApiConnectorService) { super(); }

    ngOnInit(): void {
        this.getDataComponents();
    }

    public getDataComponents(): void {
        this.loading = true;
        let data$ = this.restAPIConnectorService.getAllDataComponents();
        let sub = data$.subscribe({
            next: (results) => {
                let objects = results.data as DataComponent[];
                this.data_components = objects.filter(obj => obj.data_source_ref == this.data_source.stixID)
                this.loading = false;
            }, 
            complete: () => {sub.unsubscribe();}
        })
    }

    public createDataComponent(): void {
        let data_component = new DataComponent();
        data_component.data_source_ref = this.data_source.stixID;
        data_component.data_source = this.data_source;
        let prompt = this.dialog.open(StixDialogComponent, {
            data: {
                object: data_component,
                editable: true,
                mode: "edit",
                sidebarControl: "events"
            }
        });
        let subscription = prompt.afterClosed().subscribe({
            next: (result) => {
                if (result) {
                    if (prompt.componentInstance.dirty) this.getDataComponents(); //re-fetch values since an edit occurred
                }
            },
            complete: () => { subscription.unsubscribe(); }
        });
    }
}
